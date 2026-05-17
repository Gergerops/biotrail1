/**
 * POST /api/capture
 *
 * Receives a signup from the smoke-test modal or the footer CTA.
 * Forwards two emails via Resend:
 *   1. Notification to the team mailbox (RESEND_NOTIFY_TO)
 *   2. Confirmation to the signup (the visitor)
 *
 * This is the data spine of the Lean Startup validation:
 * every signup is a measurable funnel-bottom event.
 *
 * In dev (no RESEND_API_KEY set) it logs to console and returns 200,
 * so you can test the modal locally without configuring Resend.
 */
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

interface CaptureBody {
  email: string;
  plan: 'free' | 'premium' | 'hero' | 'general' | 'cta_final';
  locale: string;
  source: 'modal' | 'footer_cta';
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export const POST: APIRoute = async ({ request }) => {
  let body: CaptureBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400 });
  }

  const { email, plan, locale, source } = body;
  if (!email || !isValidEmail(email)) {
    return new Response(JSON.stringify({ error: 'invalid_email' }), { status: 400 });
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const notifyTo = import.meta.env.RESEND_NOTIFY_TO || 'hello@biotrail.com';
  const fromAddr = import.meta.env.RESEND_FROM || 'BioTrail <hello@biotrail.com>';

  // Dev mode — no Resend key configured. Log and return success.
  if (!apiKey) {
    console.log('[capture · DEV — no RESEND_API_KEY]', { email, plan, locale, source });
    return new Response(JSON.stringify({ ok: true, dev: true }), { status: 200 });
  }

  const resend = new Resend(apiKey);

  try {
    // 1. Team notification — this is what tells us a signup happened.
    await resend.emails.send({
      from: fromAddr,
      to: notifyTo,
      subject: `New signup · ${plan} · ${email}`,
      text: [
        `New BioTrail signup`,
        ``,
        `Email:  ${email}`,
        `Plan:   ${plan}`,
        `Locale: ${locale}`,
        `Source: ${source}`,
        `Time:   ${new Date().toISOString()}`,
      ].join('\n'),
    });

    // 2. Confirmation to the visitor.
    // Use the locale to pick the right language for the confirmation.
    const isGerman = locale === 'de';
    const subject = isGerman
      ? 'Du bist auf der BioTrail-Warteliste'
      : "You're on the BioTrail waitlist";
    const greeting = isGerman ? 'Hallo,' : 'Hi,';
    const messageBody = isGerman
      ? [
          'Danke, dass du dir deinen Platz bei BioTrail gesichert hast.',
          '',
          'Wir starten in der ersten Hälfte 2027. Du bekommst eine E-Mail, sobald BioTrail bereit ist — und du behältst deinen Early-Access-Preis lebenslang.',
          '',
          'Wenn du Fragen hast, antworte einfach auf diese E-Mail.',
          '',
          'Bis bald,',
          'Das BioTrail-Team',
          'Frankfurt am Main',
        ]
      : [
          'Thank you for reserving your spot at BioTrail.',
          '',
          "We're launching in the first half of 2027. You'll get an email the moment BioTrail is ready, and you'll keep your early-access pricing for life.",
          '',
          'If you have questions, just reply to this email.',
          '',
          'See you soon,',
          'The BioTrail team',
          'Frankfurt am Main',
        ];

    await resend.emails.send({
      from: fromAddr,
      to: email,
      subject,
      text: [greeting, '', ...messageBody].join('\n'),
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('[capture] resend error', err);
    // Still return 200 so the user gets a thank-you UX —
    // we'll see the error in logs and follow up.
    // Toggle to 500 here if you'd rather show the error state.
    return new Response(JSON.stringify({ ok: true, soft_error: true }), { status: 200 });
  }
};
