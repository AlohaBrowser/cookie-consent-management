$(document).ready(function() {
    if (globalThis.cookiesConsentManager?.consentPreferences) {
    	console.log(globalThis);
        const consentMode = globalThis.cookiesConsentManager.consentMode;
        const consentMessages = {
            askEveryTime: "The user is shown a window with a question.",
            denyAll: "The user has refused all cookies.",
            allowAll: "The user has accepted all cookies.",
            allowRequired: "The user has accepted the necessary cookies.",
            allowAnalytical: "The user has accepted the necessary cookies + analytics.",
            allowCustom: "The user has selected special cookie values."
        };

        $(".log").append(`<div>Current mode: <span class="text-success">${consentMode}</span></div>`);
        $(".log").append(`<div>${consentMessages[consentMode] || "Unknown mode"}</div>`);
    } else {
        $(".log").append("<div class='text-danger'>Consent mode not set</div>");
    }
});