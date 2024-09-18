function check_package(package) {
    const xssPatterns = [/<script>/, /<img.*onerror/];
    for (const pattern of xssPatterns) {
        if (pattern.test(package.url) || pattern.test(package.body)) {
            return false;
        }
    }
    return true;
}
