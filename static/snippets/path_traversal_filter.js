function check_package(package) {
    const pathTraversalPattern = /\.\.\//;
    if (pathTraversalPattern.test(package.url)) {
        return false;
    }
    return true;
}
