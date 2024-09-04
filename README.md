# Cookie Consent Management

## Motivation

Currently, websites are required to present users from the EU with a dialog for selecting which cookies to accept. While the motivation behind this law is understandable, the resulting workflow is difficult to describe as convenient for both users and websites.

At the same time, cookie consent messages are commonly blocked using an Adblock lists (e.g., "I don't care about cookies"). While this approach is effective in removing these messages, it does not allow the user to control how the cookies are managed—whether they are accepted, rejected, or dismissed without a clear response. Additionally, there is no option to selectively accept or reject specific cookies.

At Aloha, we believe it's time for a paradigm shift in how cookie consent is managed. We propose moving it from the website level to the browser level, providing a more user-centric and effective approach to privacy management.

## Key features of the proposed standard

1. Browser-level consent management:
    *   Move consent controls from individual websites to the browser settings.
    *   Eliminate the need for per-site cookie banners and popups.
2. Global consent options:
    *   "Allow all" cookies
    *   "Reject all" cookies
    *   Custom settings for different cookie categories (e.g., necessary, functional, analytics, advertising)
3. Per-site granular settings:
    *   Users can customize their cookie preferences for specific websites.
    *   Ability to override global settings on a site-by-site basis.
4. Standardized cookie categories:
    *   Define a common set of cookie categories across all websites.
    *   Ensure consistency in how cookies are classified and presented to users.
5. Consent storage and communication:
    *   Browsers store user consent preferences securely.
    *   Implement a standardized API for websites to query the user's consent status.
6. Audit trail and compliance:
    *   Maintain a log of consent changes for GDPR compliance.
    *   Provide tools for users to review and modify their consent history.
7. Proactive reaction:
    *   Based on the user choice, the browser can decide how to react to third party cookies and may block cookie requests from malicious websites.

## Proposed Solution Details

### The workflow

**1\. User Website Access:**

Upon a user's visit to a website, the **website** initiates the consent management process.


**2\. Browser Capability Check:**

The **website** queries the **browser** to determine if it supports advanced cookie management features.

*   If the **browser** lacks support, the **website** displays a standard cookie consent dialog as per conventional practices.
*   If the **browser** supports cookie management features, the **website** retrieves the user’s stored cookie preferences from the browser.

**3\. Preference Handling:**

The website processes the retrieved preferences.

*   If a preference such as "allowAll," "denyAll," or similar is detected, the website applies the corresponding settings and continues operation without further user interaction.
*   If the preference is "askEveryTime", the website transmits information about the cookie categories and their intended purposes to the browser.

**4\. Browser Consent Dialog:**

The browser displays a consent dialog to the user, incorporating the information provided by the website about the specific cookie categories.

**5\. User Choice Communication:**

The user's consent decision is communicated back to the website, which then applies the chosen settings to the website’s operation.

**6\. Future Visit Preferences:**

The browser may store the user's decision for future interactions with the website. In subsequent visits, the browser may use the "allowCustom" preference to relay the saved settings back to the website, streamlining the consent process.

### Mandatory Part

It is proposed to implement a browser API that enables websites to determine and manage the user's cookie preferences. This API would function similarly to the "ethereum" object in the browser's JavaScript API, which facilitates interaction with wallet-enabled websites.
<br/>A new `cookiesConsentManager` object would be introduced to the `globalThis` scope, with a `consentPreferences` property reflecting the user's choices, which are likely configured within the browser interface. The `consentPreferences` object would contain the following values:

```jsvascript
const consentValues = {
    ASK_EVERY_TIME: "askEveryTime",
    DENY_ALL: "denyAll",
    ALLOW_ALL: "allowAll",
    ALLOW_CUSTOM: "allowCustom"
};
```

If the value is set to `allowCustom`, this indicates that the user has specified detailed preferences, as described below.

### Detailed Preferences

When the `consentMode` is set to `askEveryTime`, the function `cookiesConsentManager.AskForPreferences(SelectableCookies selectableCookies)` should be invoked, passing a `SelectableCookies` object. This object describes the cookie categories and optionally the companies that utilize them. For each category, a name, description, and list of associated companies can be provided. Each company entry may include a name, domain, and description.

If a website **does not** support custom selection for certain cookie categories, it should indicate this by setting the `supportCustom` property to `false`. The default value for this property is `true`.
<br/>When `supportCustom` is set to `false` for a particular category, the browser should restrict the user from choosing any options other than "allow all" or "deny all" for that category.
<br/>This ensures that the user's choices are consistent with the website's supported functionality.

Additionally, if a specific category is crucial for the site, the site can set `required` to `true`, and the browser must not allow this category to be unchecked. The default value is `false`.

If the site sets `required` to `true` in the root element, it indicates that the site cannot function without cookies, and the user must either accept them or leave the site.

**Example**:

```json5
{
"categories": [
    {
        "name": "Required",
        "description": "...",
        "supportCustom": false,
        "required": false,
        "partners": [
            {
                "name": "partner1",
                "domain": "`[`partner1.com`](http://partner1.com)`",
                "description": "...."
            },
            // ...
        ]
    },
    // ...
]
}
```

The `AskForPreferences` function returns a similar (or even the same) object, with an added `consent` field for each item. 
<br/><br/>This field can contain one of the following values:
<br/>\- `allow`: The user accepted the cookies described by this object and all its descendants
<br/>\- `deny`: The user rejected the cookies described by this object and all its descendants.
<br/>\- `custom`: The user made a detailed selection, requiring inspection of child objects.

**Example**:

\- If the user selects to allow all or to deny all, the `consent` field in the `SelectableCookies` object is set to `allow` or `deny`, respectively.

\- If the user allows or denies specific categories, the `consent` field at the object level is set to `custom`, with the corresponding category-level `consent` fields reflecting the user's choices.

\- If a category-level field is `custom`, this indicates that the user has chosen to allow or deny cookies from specific companies within that category.

  
**Example, returned object, case 1: User allowed all cookies**

Top-level `consent` is set to `allow`, so, all other elements should be ignored

```json5
{
    "consent": "allow"
    "categories": [
        // ...
    ]
}
```

**Example, returned object, case 2: User allowed some categories**

Top-level consent is set to custom, so, it is required to traverse child elements/

User allowed "Required" cookies cagtegory and denied "Advertisement" category.

```json5
{
    "consent": "custom"
    "categories": [
        {
        "consent" : "allow":
        "name": "Required",
        // ...
        },
        {
        "name": "Advertisement":
        "consent" : "deny":
        },
        // ...
    ]
}
```
  

**Example, returned object, case 3: User allowed some companies within category**

Top-level consent is set to custom, so, it is required to traverse child elements.

Consent in "Required" cookies category also set to custom, therefore, user chose specific companies. In the example below, they chose to allow cookies from company "Parther1" and deny cookies from company "Parther2":

```json5
{
    "consent": "custom"
    "categories": [
        {
            "consent" : "custom":
            "name": "Required",
            "partners": [
                {
                "name": "partner1",
                "consent": "allow"
                },
                {
                "name": "partner2",
                "consent": "deny"
                },
                // ...
            ]
        },
        // ...
    ]
}
```

### Optional Features

#### Non-Compliance Notifications

In the event that cookies are explicitly denied by the user, but the website attempts to set them regardless, the browser may take the following actions:

*   **Refusal to Set Cookies**: The browser may block the attempt to set the cookies that have been explicitly denied by the user.
*   **User Notification**: The browser could notify the user about the attempted action, providing transparency regarding the website's non-compliance with the user's preferences.
*   **Reporting Mechanism**: With the explicit consent of the user (due to the potential exposure of the user's IP address), the browser may send a report of the attempted non-compliance to a designated endpoint. This report could be used for further investigation or enforcement actions against the non-compliant website.
