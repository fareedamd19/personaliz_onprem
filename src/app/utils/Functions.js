

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

  export function getProceedBtnTextColor(hexColor){
    if(!hexColor||hexColor?.toLowerCase()==="transparent"){
        return getContrastColor(optionThemeObj?.option_text_color)
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