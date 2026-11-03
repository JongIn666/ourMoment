export function parsePostLink(value: string) {
  const input = value.trim();
  if (!input) return '';

  try {
    const url = new URL(input);
    const host = url.hostname.replace(/\.$/, '');
    const labels = host.split('.');
    const domain = labels.length > 1 && labels.every((label) => (
      /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label)
    )) && /^(?:[a-z]{2,63}|xn--[a-z\d-]+)$/i.test(labels[labels.length - 1]);
    const validHost = domain || host === 'localhost' || host.startsWith('[')
      || /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host);
    if (!/^https?:\/\//i.test(input) || !validHost || host.length > 253 || /\s/.test(input) || url.href.length > 2048) {
      throw new Error();
    }
    return url.href;
  } catch {
    throw new Error('Paste a valid link starting with http:// or https://.');
  }
}
