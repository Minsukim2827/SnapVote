export function getURLParameterForTest(name, locationSearch) {
    return getURLParameter(name, locationSearch);
}

function getURLParameter(name, locationSearch = location.search) {
    return (
        decodeURIComponent(
            (new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(
                locationSearch
            ) || [, ""])[1].replace(/\+/g, "%20")
        ) || null
    );
}

export default getURLParameter;
