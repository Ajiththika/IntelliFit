/**
 * Filters message content to redact prohibited information.
 * Blocks: Phone numbers, Emails, URLs (basic)
 */

const PHONE_REGEX = /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;

const filterContent = (text) => {
    let flags = [];
    let redactedText = text;

    if (PHONE_REGEX.test(text)) {
        flags.push('PHONE_DETECTED');
        redactedText = redactedText.replace(PHONE_REGEX, '[PHONE HIDDEN]');
    }

    if (EMAIL_REGEX.test(text)) {
        flags.push('EMAIL_DETECTED');
        redactedText = redactedText.replace(EMAIL_REGEX, '[EMAIL HIDDEN]');
    }

    if (URL_REGEX.test(text)) {
        flags.push('LINK_DETECTED');
        redactedText = redactedText.replace(URL_REGEX, '[LINK HIDDEN]');
    }

    return {
        original: text,
        redacted: redactedText,
        isRedacted: flags.length > 0,
        flags
    };
};

module.exports = { filterContent };
