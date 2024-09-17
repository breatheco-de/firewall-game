function check_package(package) {
    const sqlPatterns = [/'.*OR.*'.*=.*'/, /'.*UNION.*SELECT.*/];
    for (const pattern of sqlPatterns) {
        if (pattern.test(package.url) || pattern.test(package.body)) {
            return false;
        }
    }
    return true;
}
