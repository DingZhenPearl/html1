# Automatically generated by scripts/boost/generate-ports.ps1

vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO boostorg/nowide
    REF boost-${VERSION}
    SHA512 f3dd88c9c48360cf5603a152d16626479ac23a8fa90916658f9ca2b596f28ab3b37cbb6c70e91c5a98fd59d5b5e8054015131e1bafae8146f0f5f766946b159d
    HEAD_REF master
)

set(FEATURE_OPTIONS "")
boost_configure_and_install(
    SOURCE_PATH "${SOURCE_PATH}"
    OPTIONS ${FEATURE_OPTIONS}
)
