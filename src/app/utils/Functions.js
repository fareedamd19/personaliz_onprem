

export function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


export function replacePercent40(email) {
    if (email.includes('%40')) {
        return email.replace('%40', '@');
    } else {
        return email;
    }
}

export function checkIfParamsArePresent(){
    const actualUrl = new URL(window.location.href)
    let campaignId = actualUrl.searchParams.get("id")
    let emailOfUser = actualUrl.searchParams.get("email")
    let contact_id = actualUrl.searchParams.get("uid")
    let mode = actualUrl.searchParams.get("mode")
    // Fallback for single-param links (?d=<campaignId>_<contactId>). Used when a URL tracker/shortener
    // (e.g. Meta WhatsApp URL tracking) strips everything after '&'. Existing ?id=&uid= links are unaffected.
    const combined = actualUrl.searchParams.get("d")
    if (combined) {
        const sep = combined.indexOf("_")
        if (sep !== -1) {
            if (!campaignId) campaignId = combined.slice(0, sep)
            if (!contact_id) contact_id = combined.slice(sep + 1)
        }
    }
    return {campaignId,emailOfUser,contact_id,mode}
}

export function pauseAllVideos() {
    // Select all video elements on the page
    const videos = document.querySelectorAll('video');
    
    // Iterate through each video element and pause it
    videos.forEach(video => {
        video.pause();
    });

  }

  export function getProceedBtnTextColor(hexColor, option_text_color){
    if(!hexColor||hexColor?.toLowerCase()==="transparent"){
        return getContrastColor(option_text_color)
    }
    else if (hexColor?.length === 9 && hexColor?.startsWith("#")) {
        // Extract RGB part (without alpha)
        const rgbHex = hexColor.substring(0, 7);
        return rgbHex;
    } else {
        // If there's no alpha channel, return the original color
        return hexColor;
    }
}

export function addOpacity(hexColor) {
    // Remove '#' if present
    hexColor = hexColor.replace('#', '');

    // Convert HEX to RGB
    var r = parseInt(hexColor.substring(0, 2), 16);
    var g = parseInt(hexColor.substring(2, 4), 16);
    var b = parseInt(hexColor.substring(4, 6), 16);

    // Convert RGB to RGBA with opacity 0.1
    var rgbaColor = 'rgba(' + r + ', ' + g + ', ' + b + ', 0.1)';
    
    return rgbaColor;
}

function checkColorFormat(color) {
    if (/^rgba\(\d+,\s*\d+,\s*\d+,\s*(?:1|0?\.\d+)\)$/.test(color)) {
      return 'rgba';
    } else if (/^rgb\(\d+,\s*\d+,\s*\d+\)$/.test(color)) {
      return 'rgb';
    } else if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return 'hex';
    } else {
      return null;
    }
  }

function hexToRgb(color) {
    const format =  checkColorFormat(color)
    if (format === 'rgba') {
        const rgbaValues = color.match(/\d+/g).map(Number);
        const [r, g, b] = rgbaValues.slice(0, 3);
        return {r,g,b};
      } else if (format === 'rgb') {
        const rgbValues = color.match(/\d+/g).map(Number);
        const [r, g, b] = rgbValues;
        return {r,g,b};
      } else if (format === 'hex') {
        const hexValue = color.replace(/^#/, '');
        let r, g, b;
        if (hexValue.length === 3) {
          r = parseInt(hexValue[0] + hexValue[0], 16);
          g = parseInt(hexValue[1] + hexValue[1], 16);
          b = parseInt(hexValue[2] + hexValue[2], 16);
        } else if (hexValue.length === 6) {
          r = parseInt(hexValue.slice(0, 2), 16);
          g = parseInt(hexValue.slice(2, 4), 16);
          b = parseInt(hexValue.slice(4, 6), 16);
        } else {
          return null;
        }
      return {r,g,b};
      } else {
        return null;
      }
  }

export  function getContrastColor(color) {
    if(color==='transparent'||color==="undefined"||!color){return null}
    let rgbColor=hexToRgb(color)
    
    // Calculate the brightness of the color
    let brightness = (1 - (0.299 * rgbColor.r + 0.587 * rgbColor.g + 0.114 * rgbColor.b)) * 255;
  
    // If the color is light, use a dark color for the contrast
    if (brightness > 128) {
      return '#fff';
    }
  
    // Otherwise, use a light color for the contrast
    return '#000';
  }