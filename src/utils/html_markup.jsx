 import DOMPurify from 'dompurify';

function htmlMarkup(dirty) {
  const sanitizedHtml = DOMPurify.sanitize(dirty);
  return { __html: sanitizedHtml };
}



export { htmlMarkup };
