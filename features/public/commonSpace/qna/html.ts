/**
 * 질의응답 본문이 실제 HTML 태그를 포함하는지 판별할 정규식이다.
 */
const COMMON_SPACE_QNA_HTML_TAG_PATTERN = /<[^>]+>/;

/**
 * HTML 정규화 시 허용할 태그 목록이다.
 */
const COMMON_SPACE_QNA_ALLOWED_TAG_NAMES = new Set([
  "B",
  "BR",
  "DIV",
  "FONT",
  "LI",
  "OL",
  "P",
  "S",
  "SPAN",
  "STRIKE",
  "STRONG",
  "U",
  "UL",
]);

/**
 * 정렬 속성으로 허용할 값 목록이다.
 */
const COMMON_SPACE_QNA_ALLOWED_TEXT_ALIGNMENTS = new Set([
  "left",
  "center",
  "right",
  "justify",
]);

/**
 * 일반 텍스트를 안전한 HTML 문자열로 이스케이프한다.
 */
function escapeCommonSpaceQnaHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * HTML 렌더링에 사용할 색상 값을 허용 목록 기준으로 정규화한다.
 */
function normalizeCommonSpaceQnaColorValue(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase().replaceAll(/\s+/g, "");
  const matchedHexColor = normalizedValue.match(/^#([0-9a-f]{6})$/i);
  const matchedRgbColor = normalizedValue.match(
    /^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/i,
  );

  if (matchedHexColor) {
    return matchedHexColor[0];
  }

  if (!matchedRgbColor) {
    return null;
  }

  const rgbValues = matchedRgbColor.slice(1).map((token) => Number(token));
  const isValidRgbColor = rgbValues.every(
    (channelValue) => channelValue >= 0 && channelValue <= 255,
  );

  return isValidRgbColor
    ? `#${rgbValues.map((channelValue) => channelValue.toString(16).padStart(2, "0")).join("")}`
    : null;
}

/**
 * HTML 렌더링에 사용할 정렬 값을 허용 목록 기준으로 정규화한다.
 */
function normalizeCommonSpaceQnaAlignment(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  return COMMON_SPACE_QNA_ALLOWED_TEXT_ALIGNMENTS.has(normalizedValue)
    ? normalizedValue
    : null;
}

/**
 * HTML 렌더링에 사용할 굵기 값을 허용 목록 기준으로 정규화한다.
 */
function normalizeCommonSpaceQnaFontWeight(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  const numericFontWeight = Number(normalizedValue);

  if (normalizedValue === "bold" || normalizedValue === "bolder") {
    return "bold";
  }

  if (Number.isFinite(numericFontWeight) && numericFontWeight >= 600) {
    return "bold";
  }

  return null;
}

/**
 * HTML 렌더링에 사용할 취소선/밑줄 값을 허용 목록 기준으로 정규화한다.
 */
function normalizeCommonSpaceQnaTextDecoration(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  const hasUnderline = normalizedValue.includes("underline");
  const hasLineThrough = normalizedValue.includes("line-through");

  if (hasUnderline && hasLineThrough) {
    return "underline line-through";
  }

  if (hasUnderline) {
    return "underline";
  }

  if (hasLineThrough) {
    return "line-through";
  }

  return null;
}

/**
 * DOMParser를 사용할 수 없는 환경에서 텍스트 추출에 사용할 fallback이다.
 */
function extractCommonSpaceQnaTextFallback(html: string) {
  return html
    .replaceAll(/\r\n?/g, "\n")
    .replaceAll(/<br\s*\/?>/gi, "\n")
    .replaceAll(/<\/(div|p|li|ul|ol)>/gi, "\n")
    .replaceAll(/<[^>]+>/g, "")
    .replaceAll(/&nbsp;/gi, " ")
    .replaceAll(/&amp;/gi, "&")
    .replaceAll(/&lt;/gi, "<")
    .replaceAll(/&gt;/gi, ">")
    .replaceAll(/&quot;/gi, '"')
    .replaceAll(/&#39;/gi, "'")
    .replaceAll(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * 일반 텍스트를 문단 구조를 가진 HTML 문자열로 변환한다.
 */
function createCommonSpaceQnaHtmlFromPlainText(value: string) {
  const normalizedValue = value.replaceAll(/\r\n?/g, "\n").trim();

  if (normalizedValue === "") {
    return "";
  }

  return normalizedValue
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeCommonSpaceQnaHtml(paragraph).replaceAll("\n", "<br />")}</p>`)
    .join("");
}

/**
 * 현재 값이 일반 텍스트인지 HTML 문자열인지 판별한다.
 */
function isCommonSpaceQnaPlainText(value: string) {
  return !COMMON_SPACE_QNA_HTML_TAG_PATTERN.test(value);
}

/**
 * DOM 노드 하나를 허용된 HTML 구조로 정규화한다.
 */
function sanitizeCommonSpaceQnaNode(node: Node, document: Document) {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent ?? "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toUpperCase();

  if (tagName === "BR") {
    return document.createElement("br");
  }

  if (!COMMON_SPACE_QNA_ALLOWED_TAG_NAMES.has(tagName)) {
    const fragment = document.createDocumentFragment();

    Array.from(element.childNodes).forEach((childNode) => {
      const sanitizedChildNode = sanitizeCommonSpaceQnaNode(childNode, document);

      if (sanitizedChildNode) {
        fragment.appendChild(sanitizedChildNode);
      }
    });

    return fragment;
  }

  const normalizedTagName =
    tagName === "B"
      ? "strong"
      : tagName === "FONT"
        ? "span"
        : tagName === "STRIKE"
          ? "s"
          : tagName.toLowerCase();
  const sanitizedElement = document.createElement(normalizedTagName);
  const styleTokens: string[] = [];
  const alignment = normalizeCommonSpaceQnaAlignment(
    element.style.textAlign || element.getAttribute("align"),
  );
  const color = normalizeCommonSpaceQnaColorValue(
    tagName === "FONT" ? element.getAttribute("color") : element.style.color,
  );
  const fontWeight = normalizeCommonSpaceQnaFontWeight(element.style.fontWeight);
  const textDecoration = normalizeCommonSpaceQnaTextDecoration(
    element.style.textDecorationLine || element.style.textDecoration,
  );

  if (alignment) {
    styleTokens.push(`text-align:${alignment}`);
  }

  if (color) {
    styleTokens.push(`color:${color}`);
  }

  if (fontWeight) {
    styleTokens.push(`font-weight:${fontWeight}`);
  }

  if (textDecoration) {
    styleTokens.push(`text-decoration:${textDecoration}`);
  }

  if (styleTokens.length > 0) {
    sanitizedElement.setAttribute("style", styleTokens.join(";"));
  }

  Array.from(element.childNodes).forEach((childNode) => {
    const sanitizedChildNode = sanitizeCommonSpaceQnaNode(childNode, document);

    if (sanitizedChildNode) {
      sanitizedElement.appendChild(sanitizedChildNode);
    }
  });

  return sanitizedElement;
}

/**
 * 질문/답변 HTML을 저장 가능한 안전한 구조로 정규화한다.
 */
export function normalizeCommonSpaceQnaHtml(value: string) {
  const normalizedValue = value.trim();

  if (normalizedValue === "") {
    return "";
  }

  const htmlValue = isCommonSpaceQnaPlainText(normalizedValue)
    ? createCommonSpaceQnaHtmlFromPlainText(normalizedValue)
    : normalizedValue;

  if (typeof DOMParser === "undefined") {
    return createCommonSpaceQnaHtmlFromPlainText(
      extractCommonSpaceQnaTextFallback(htmlValue),
    );
  }

  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(`<body>${htmlValue}</body>`, "text/html");
  const sanitizedContainer = parsedDocument.createElement("div");

  Array.from(parsedDocument.body.childNodes).forEach((childNode) => {
    const sanitizedChildNode = sanitizeCommonSpaceQnaNode(childNode, parsedDocument);

    if (sanitizedChildNode) {
      sanitizedContainer.appendChild(sanitizedChildNode);
    }
  });

  return sanitizedContainer.innerHTML.trim();
}

/**
 * HTML 문자열에서 실제 입력 텍스트만 추출한다.
 */
export function extractCommonSpaceQnaTextContent(value: string) {
  const normalizedValue = value.trim();

  if (normalizedValue === "") {
    return "";
  }

  if (typeof DOMParser === "undefined") {
    return extractCommonSpaceQnaTextFallback(normalizedValue);
  }

  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(
    `<body>${normalizeCommonSpaceQnaHtml(normalizedValue)}</body>`,
    "text/html",
  );

  return (parsedDocument.body.textContent ?? "").replaceAll(/\u00a0/g, " ").trim();
}

/**
 * 화면 렌더링 전에 질문/답변 본문을 HTML 기준으로 정규화한다.
 */
export function getRenderableCommonSpaceQnaHtml(value: string) {
  return normalizeCommonSpaceQnaHtml(value);
}
