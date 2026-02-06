fx_version 'cerulean'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'
game 'rdr3'

author 'Zoo Scripts'
description 'Zoo Input - Custom Input System with Preview Buttons'
version '1.1.0'

client_scripts {
    'client/*.lua'
}

server_scripts {
    'server/*.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/styles/*.css',
    'html/script.js',
    'html/img/*.png',
    'html/fonts/*.ttf'
}

lua54 'yes'
