const productSizes = [
  { size: "75 ml", oldPrice: "177,00 €", price: "88,95 €", reference: "100 ml / 118,60 €" },
  { size: "50 ml", oldPrice: "147,00 €", price: "76,96 €", reference: "100 ml / 153,92 €" },
  { size: "30 ml", oldPrice: "106,00 €", price: "53,95 €", reference: "100 ml / 179,83 €" }
];

const sizeSelector = document.getElementById("size-selector");
const selectedPrice = document.getElementById("selected-price");
const selectedReferencePrice = document.getElementById("selected-reference-price");
const talkButton = document.getElementById("talk-about-product");
const productImage = document.getElementById("product-image");
const brandLogo = document.getElementById("brand-logo");
const customWidgetLauncher = document.getElementById("custom-widget-launcher");
const customWidgetAvatar = document.getElementById("custom-widget-avatar");
const AUTH_FLAG = "demo_widget_authenticated";

function resolveAppBasePath() {
  const envBase = import.meta.env.BASE_URL || "/";
  if (envBase && envBase !== "/") return envBase;

  const [firstSegment] = window.location.pathname.split("/").filter(Boolean);
  if (!firstSegment || firstSegment.endsWith(".html")) return "/";
  return `/${firstSegment}/`;
}

const baseUrl = resolveAppBasePath();

if (sessionStorage.getItem(AUTH_FLAG) !== "1") {
  window.location.replace(baseUrl);
}

function resolveAssetUrl(url) {
  if (!url) return "";

  const trimmed = url.trim();
  const isExternal =
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:");
  if (isExternal) return trimmed;

  const normalized = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  return new URL(normalized, window.location.origin + baseUrl).toString();
}

const srcImages = Object.entries(
  import.meta.glob("./images/*.{png,jpg,jpeg,webp,gif,svg}", {
    eager: true,
    import: "default"
  })
).map(([path, url]) => ({ path: path.toLowerCase(), url }));

const cfg = {
  agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID || "",
  signedUrl: import.meta.env.VITE_ELEVENLABS_SIGNED_URL || "",
  serverLocation: import.meta.env.VITE_ELEVENLABS_SERVER_LOCATION || "us",
  overrideLanguage: import.meta.env.VITE_ELEVENLABS_OVERRIDE_LANGUAGE || "",
  overrideFirstMessage: import.meta.env.VITE_ELEVENLABS_OVERRIDE_FIRST_MESSAGE || "",
  overridePrompt: import.meta.env.VITE_ELEVENLABS_OVERRIDE_PROMPT || "",
  overrideVoiceId: import.meta.env.VITE_ELEVENLABS_OVERRIDE_VOICE_ID || "",
  avatarImageUrl: resolveAssetUrl(
    import.meta.env.VITE_ELEVENLABS_AVATAR_IMAGE_URL ||
      "https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif"
  ),
  productImageUrl: resolveAssetUrl(
    import.meta.env.VITE_PRODUCT_IMAGE_URL || "/images/producto-clarins.png"
  ),
  logoImageUrl: resolveAssetUrl(import.meta.env.VITE_BRAND_LOGO_URL || "/images/logo-perfumesclub.png"),
  brand: import.meta.env.VITE_PRODUCT_BRAND || "Clarins",
  userName: import.meta.env.VITE_USER_NAME || "Krystian",
  itemId: import.meta.env.VITE_PRODUCT_ITEM_ID || "68580"
};

let selected = productSizes[0];

function getWidget() {
  return document.getElementById("elevenlabs-widget");
}

function pickSrcImageByKeywords(keywords) {
  const match = srcImages.find((entry) => keywords.some((k) => entry.path.includes(k)));
  return match?.url || "";
}

function canLoadImage(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

async function resolveBestImage(preferredUrl, candidateUrls, srcDetectedUrl, fallbackUrl) {
  if (await canLoadImage(preferredUrl)) return preferredUrl;
  if (await canLoadImage(srcDetectedUrl)) return srcDetectedUrl;

  for (const candidate of candidateUrls) {
    if (await canLoadImage(candidate)) return candidate;
  }

  return fallbackUrl;
}

function drawSizes() {
  sizeSelector.innerHTML = "";

  productSizes.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `size-btn ${item.size === selected.size ? "active" : ""}`;
    btn.innerHTML = `
      <span class="size">${item.size}</span>
      <span class="old-price">${item.oldPrice}</span>
    `;

    btn.addEventListener("click", () => {
      selected = item;
      selectedPrice.textContent = item.price;
      selectedReferencePrice.textContent = item.reference;
      drawSizes();
      applyWidgetRuntimeVariables();
    });

    sizeSelector.appendChild(btn);
  });

  selectedPrice.textContent = selected.price;
  selectedReferencePrice.textContent = selected.reference;
}

function isUsableSignedUrl(url) {
  if (!url) return false;
  // Evita confundir el endpoint de API con una URL firmada real para el widget.
  return !url.includes("/v1/agents/") && !url.includes("/signed-url?");
}

function applyWidgetRuntimeVariables(variant) {
  const widget = getWidget();
  if (!widget) return;

  const dynamicVariables = {
    user_name: cfg.userName,
    brand: cfg.brand,
    item_id: cfg.itemId,
    selected_size: selected.size,
    selected_price: selected.price,
    reference_price: selected.reference
  };

  if (isUsableSignedUrl(cfg.signedUrl)) {
    widget.setAttribute("signed-url", cfg.signedUrl);
    widget.removeAttribute("agent-id");
  } else if (cfg.agentId) {
    widget.setAttribute("agent-id", cfg.agentId);
    widget.removeAttribute("signed-url");
  } else {
    console.warn("No hay agent-id válido ni signed-url utilizable para ElevenLabs.");
  }

  widget.setAttribute("server-location", cfg.serverLocation);
  widget.setAttribute("action-text", "");
  widget.setAttribute("expand-text", "");
  if (variant) {
    widget.setAttribute("variant", variant);
  }
  widget.setAttribute("avatar-image-url", cfg.avatarImageUrl);
  widget.setAttribute("dynamic-variables", JSON.stringify(dynamicVariables));

  if (cfg.overrideLanguage) {
    widget.setAttribute("override-language", cfg.overrideLanguage);
  } else {
    widget.removeAttribute("override-language");
  }

  if (cfg.overrideFirstMessage) {
    widget.setAttribute("override-first-message", cfg.overrideFirstMessage);
  } else {
    widget.removeAttribute("override-first-message");
  }

  if (cfg.overridePrompt) {
    widget.setAttribute("override-prompt", cfg.overridePrompt);
  } else {
    widget.removeAttribute("override-prompt");
  }

  if (cfg.overrideVoiceId) {
    widget.setAttribute("override-voice-id", cfg.overrideVoiceId);
  } else {
    widget.removeAttribute("override-voice-id");
  }
}

function revealNativeWidget() {
  const widget = getWidget();
  if (!widget) return;
  widget.classList.remove("widget-boot-hidden");
  customWidgetLauncher?.classList.add("hidden");
}

function hideNativeWidgetToInitial() {
  const widget = getWidget();
  if (!widget) return;
  widget.setAttribute("variant", "compact");
  widget.classList.add("widget-boot-hidden");
  customWidgetLauncher?.classList.remove("hidden");
}

function applyShadowUiTweaks() {
  const widget = getWidget();
  const root = widget?.shadowRoot;
  if (!root) return false;

  // Oculta el boton redundante de expandir/colapsar layout y deja el de minimizar.
  if (!root.querySelector("#custom-widget-hide-expand-style")) {
    const style = document.createElement("style");
    style.id = "custom-widget-hide-expand-style";
    style.textContent = `
      button[aria-label*="expand" i],
      button[aria-label*="fullscreen" i],
      button[title*="expand" i],
      button[title*="fullscreen" i],
      [data-testid*="expand" i],
      [data-testid*="fullscreen" i],
      [class*="expand" i],
      [class*="fullscreen" i] {
        display: none !important;
      }
    `;
    root.appendChild(style);
  }

  // Si aparecen dos controles flotantes abajo a la derecha, ocultamos el de la derecha
  // (normalmente el de expand/collapse redundante) y dejamos el negro de minimizar.
  const floatingButtons = Array.from(root.querySelectorAll("button"))
    .map((button) => ({
      button,
      rect: button.getBoundingClientRect()
    }))
    .filter(({ rect }) => {
      const isVisible = rect.width > 20 && rect.height > 20;
      const isNearBottom = rect.bottom >= window.innerHeight - 28;
      const isNearRight = rect.right >= window.innerWidth - 140;
      const isReasonableSize = rect.width <= 70 && rect.height <= 70;
      return isVisible && isNearBottom && isNearRight && isReasonableSize;
    })
    .sort((a, b) => a.rect.left - b.rect.left);

  if (floatingButtons.length >= 2) {
    const rightMost = floatingButtons[floatingButtons.length - 1].button;
    rightMost.style.setProperty("display", "none", "important");
  }

  return true;
}

function openWidgetConversation() {
  const widget = getWidget();
  if (!widget) return;

  talkButton.disabled = true;
  const originalText = talkButton.textContent;
  talkButton.textContent = "Abriendo asistente...";
  revealNativeWidget();
  widget.setAttribute("dismissible", "true");
  // Usamos modo compact para evitar mostrar controles extra de layout.
  applyWidgetRuntimeVariables("compact");

  // Segun la documentacion, "variant" controla aspecto (compact/expanded),
  // no la apertura de la conversacion. Para abrir, disparamos el launcher.
  const tryOpenLauncher = () => {
    widget.click();
    widget.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, composed: true, view: window })
    );

    const launcher =
      widget.shadowRoot?.querySelector("button,[role='button'],.launcher,[data-testid='launcher']");
    if (launcher instanceof HTMLElement) {
      launcher.click();
    }
  };

  if (widget.matches(":defined")) {
    tryOpenLauncher();
    talkButton.disabled = false;
    talkButton.textContent = originalText;
    return;
  }

  customElements.whenDefined("elevenlabs-convai").then(() => {
    const readyWidget = getWidget();
    if (readyWidget) {
      readyWidget.setAttribute("variant", "compact");
      tryOpenLauncher();
    }
    talkButton.disabled = false;
    talkButton.textContent = originalText;
  });
}

talkButton.addEventListener("click", openWidgetConversation);
customWidgetLauncher?.addEventListener("click", openWidgetConversation);

drawSizes();
applyWidgetRuntimeVariables("compact");

customElements.whenDefined("elevenlabs-convai").then(() => {
  const widget = getWidget();
  if (!widget) return;

  // Volvemos al estado inicial SOLO cuando el usuario pulsa controles de colapso/cierre.
  const bindCloseHandlers = () => {
    const root = widget.shadowRoot;
    if (!root) return false;

    root.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const button = target.closest("button,[role='button']");
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const isBottomRightControl =
          rect.width > 20 &&
          rect.height > 20 &&
          rect.width <= 72 &&
          rect.height <= 72 &&
          rect.bottom >= window.innerHeight - 24 &&
          rect.right >= window.innerWidth - 160;

        // Evita colapsar por botones internos de llamada/audio/mensajeria.
        if (!isBottomRightControl) return;

        const text =
          `${button.getAttribute("aria-label") || ""} ${button.getAttribute("title") || ""} ${
            button.getAttribute("data-testid") || ""
          } ${button.className || ""}`.toLowerCase();

        if (
          text.includes("min") ||
          text.includes("collapse") ||
          text.includes("dismiss")
        ) {
          window.setTimeout(hideNativeWidgetToInitial, 80);
        }
      },
      true
    );

    return true;
  };

  const closeBound = bindCloseHandlers();

  let tries = 0;
  const retry = window.setInterval(() => {
    tries += 1;
    applyShadowUiTweaks();
    if ((closeBound || bindCloseHandlers()) && tries > 20) {
      window.clearInterval(retry);
    }
  }, 250);

  applyShadowUiTweaks();
});

async function initImages() {
  const srcDetectedLogo = pickSrcImageByKeywords(["logo", "perfume", "club", "marca", "brand"]);
  const srcDetectedProduct = pickSrcImageByKeywords([
    "producto",
    "product",
    "clarins",
    "serum",
    "68580"
  ]);

  const logoCandidates = [
    "/images/logo_perfumesclub.png",
    "/images/logo-perfumesclub.png",
    "/images/logo.png",
    "/images/brand-logo.png"
  ].map(resolveAssetUrl);
  const productCandidates = [
    "/images/198797.webp",
    "/images/producto-clarins.png",
    "/images/product.png",
    "/images/clarins.png",
    "/images/68580.png"
  ].map(resolveAssetUrl);

  const finalLogo = await resolveBestImage(
    cfg.logoImageUrl,
    logoCandidates,
    srcDetectedLogo,
    ""
  );

  const finalProduct = await resolveBestImage(
    cfg.productImageUrl,
    productCandidates,
    srcDetectedProduct,
    "https://images.unsplash.com/photo-1556229010-aa3f7ff66b24?auto=format&fit=crop&w=1200&q=80"
  );

  if (finalLogo) {
    brandLogo.src = finalLogo;
  } else {
    brandLogo.style.display = "none";
  }

  productImage.src = finalProduct;
  if (customWidgetAvatar) {
    customWidgetAvatar.src = cfg.avatarImageUrl;
  }
}

initImages();
