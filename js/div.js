var path = 'root';
var tempPath = '';
var username = '';
var password = '';
var isLoggedIn = false;
var poweredOn = false;

$('#off').css('left', ($(document).width() / 2) - ($('#off').width() / 2));

$(function() {
    $(document).on('keydown', '#txt', function(e) {
        $this = $(this);
        var text = $this.val();
        if (e.keyCode === 13) {
            e.preventDefault();
            if (text) {
                $this.val('');
                if ($this.prop('type') !== 'password') {
                    $('#out').append('<pre>' + text + '</pre><pre></pre>');
                }
                evaluateCommand($.trim(text));
            }
            return false;
        }
    });
    $(document).click(function(e) {
        $('#txt').focus();
    });
    $('#off h3').click(function(e) {
        if (!poweredOn) {
            poweredOn = true;
            $('#off').fadeOut('fast');
            setTimeout(function() {
                init();
                $('#off').remove();
            }, 1500);
        }
    });
    $(document).keydown(function(e) {
        if (!poweredOn) {
            if (e.keyCode === 13) {
                poweredOn = true;
                $('#off').fadeOut('fast');
                setTimeout(function() {
                    init();
                    $('#off').remove();
                }, 1500);
            }
        }
    });
    // $('#in').on('keydown', '#txt', function(event) {
    //     if (keyCode === 38 || keyCode === 40) {
    //         event.preventDefault();
    //         $('#txt').val($('#out .user-input').text());
    //     }
    // });
    $('#out').on('DOMNodeInserted', function(event) {
        $('body').scrollTop($(document).height());
    });
});
function evaluateCommand(command) {
    var pre = $('#out > pre:last-child');
    var cmdSplit = command.split(' ');
    var cmd = cmdSplit[0];
    var cmdVal = cmdSplit[1];
    if (path == 'username') {
        username = cmd;
        $('#txt').replaceWith('<input type="password" id="txt">');
        printMessages([{msg: 'Enter password:'}]);
        changePath('password');
    } else if (path == 'password') {
        password = cmd;
        $('#txt').replaceWith('<textarea id="txt" disabled=""></textarea>');
        $.getJSON('php/functions.php', {user: username, pass: password}, function(json, textStatus) {
            if (json.status === 1) {
                isLoggedIn = true;
                printMessages([{msg: 'Login successful!'}]);
            } else {
                printMessages([{msg: 'Login failed!', color: '#f00'}]);
            }
        });
        changePath(tempPath);
        tempPath = '';
    } else if (path === 'send') {
        var sendVal = parseInt(cmd, 10);
        if (typeof sendVal === 'number') {
            $('#in').hide();
            printMessages([{msg: "Connecting to server...", timeout: 2000 }], function() {
                var modem = new Audio('lyd/modem.mp3');
                modem.play();
                modem.addEventListener("ended", function() {
                    $.getJSON('php/functions.php', { send: sendVal}, function(json, textStatus) {
                        if (json.status === 1) {
                            printMessages([
                                {msg: 'Data sendt to server.', timeout: 1000},
                                {msg: 'Processing...', timeout: 5000},
                                {msg: 'Data is correct!', timeout: 1000},
                                {msg: 'Answer: ' + json.message, timeout: 1000}],
                                function() {
                                    $('#in').show();
                                    changePath('root');
                                    $('#out pre.cursor').html('').removeAttr('class');
                                }
                            );
                        } else {
                            printMessages([{msg: json.message}], function() {
                                $('#in').show();
                                changePath('root');
                            });
                        }
                    });
                });
            });
        } else {
            printMessages([{msg: 'You can only send a number. Please try again.'}]);
        }
    } else if (path === 'volume') {
        // if (command === '60') {
        //     $('#txt').replaceWith('<textarea id="txt" disabled=""></textarea>');
        //     changePath('root');
        // } else {
        //     printMessages([{msg: "Incorrect! Try again.", color: '#f00'}]);
        // }
    } else {
        switch (cmd.toLowerCase()) {
            case 'clear':
                $('#out').html('<pre></pre>');
                break;
            case 'help':
                if (cmdVal == 'cd') {
                    printMessages([{msg: 'Displays the name of or changes the current directory. Usage: "cd directory" or "cd /" to go back.'}]);
                } else if (cmdVal == 'dir') {
                    printMessages([{msg: "Displays the content of the current directory."}]);
                } else if (cmdVal == 'login') {
                    printMessages([{msg: "Lets you log in to a secret area."}]);
                } else if (cmdVal == 'open') {
                    printMessages([{msg: 'Opens a file. Usage: "open file.txt"'}]);
                } else if (cmdVal == 'volume') {
                    printMessages([{msg: 'Validates the volume.'}]);
                } else if (cmdVal == 'clear') {
                    printMessages([{msg: 'Clears the console window.'}]);
                } else if (cmdVal == 'send') {
                    printMessages([{msg: 'Sends data to the server for processing. Format must be two digits.'}]);
                } else {
                    printMessages([{msg: 'Available commands:\nhelp    cd    dir    send    open    clear\nType "help command" for command specific help.'}]);
                }
                break;
            case 'send':
                printMessages([{msg: 'Enter data:'}], function() {
                    changePath('send');
                });
                break;
            case 'cd':
                if (typeof cmdVal !== 'undefined') {
                    if (cmdVal == '/') {
                        changePath('root');
                    } else {
                        var directory = 'root/' + cmdVal;
                        $.getJSON('php/functions.php', {cd: directory}, function(json, textStatus) {
                            if (json.status === 1) {
                                changePath('root/' + cmdVal);
                            } else if (json.status === 2) {
                                printMessages([{msg: "Error! Path not allowed", color: "#f00"}]);
                            } else {
                                printMessages([{msg: "Folder does not exist (" + directory + ')'}]);
                            }
                        });
                    }
                } else {
                    printMessages([{msg: path}]);
                }
                break;
            case 'dir':
                dir($('.path').text().replace('>', ''));
                break;
            case 'login':
                tempPath = path;
                printMessages([{msg: 'Enter username:'}]);
                changePath('username');
                break;
            case 'open':
                if (typeof cmdVal !== 'undefined') {
                    $.getJSON('php/functions.php', { open: path + '/' + cmdVal }, function(json) {
                        if (json.exists) {
                            if (json.type === 'text') {
                                printMessages([{msg: json.content}]);
                            } else if (json.type === 'music') {
                                var audio = new Audio(json.path);
                                printMessages([{msg: 'Starting "' + cmdVal + '"...'}], function() {
                                    audio.play();
                                });
                            } else {
                                printMessages([{msg: 'Filetype "' + cmdVal.substr((Math.max(0, cmdVal.lastIndexOf(".")) || Infinity) + 1) + '" not supported'}]);
                            }
                        } else {
                            printMessages([{msg: 'File "' + cmdVal + '" does not exist'}]);
                        }
                    });
                }
                break;
            case 'volume':
                printMessages([{msg: "Enter volume (xx):"}], function() {
                    $('#txt').replaceWith('<input type="text" id="txt">');
                    changePath('volume');
                });
                break;
            default:
                printMessages([{msg: 'Unknown command: "' + command + '". Type "help" for a list of available commands.', color: '#f00'}]);
                break;
        }
    }
}
function changePath(newPath) {
    path = newPath;
    $('.path').text(path + '>');
    txtareaSize();
}
function dir(dir) {
    $.getJSON('php/functions.php?dir=' + dir, function(json, textStatus) {
        if (json.status !== null) {
            var content = [];
            $.each(json.content, function(index, val) {
                content.push(val);
            });
            printMessages([{msg: '"' + path + '" contains:\n' + content.join("    ")}]);
        } else {
            printMessages([{msg: "Folder is empty or the path/file does not exist (" + dir + ')'}]);
        }
    });
}
function init() {
    txtareaSize();
    $('#out').show();

    var msgs = [
        {msg: "Booting system...\n ", timeout: 5000},
        {msg: 'Main Processor\t:\tPentium 370MHz', timeout: 5000},
        {msg: 'Memory Test\t:\t128K OK\n ', timeout: 2000},
        {msg: 'Copyright (C) 1992, Unknown company\n ', timeout: 1000},
        {msg: 'Starting command line...', timeout: 3000},
        {msg: 'Executing script: "solost_easter_2016.bat"', timeout: 5000}
    ];

    printMessages(msgs, function() {
        $('#out *').remove();
        printMessages([{ msg: "", timeout: 1 },{ msg: "Welcome to Soløst Easter 2016", timeout: 1000 }], function() {
            $('#out pre:last-child').html('').removeClass();
            $('.path').show();
        });
    });
}
var sysOut = function(msg, color, addWait) {
    var promise = new Promise(function(resolve, reject) {
        var txt = $('#txt');
        var index = 0;
        var out = $('#out pre:last-child');
        color = (typeof color === 'undefined') ? '#ddd' : color ;
        txt.attr('disabled', 'disabled');
        out.html('').removeAttr('class').css('color', color);
        var charOut = setInterval(function() {
            out.append(msg[index++]);
            if (index >= msg.length) {
                $('#out').append('<pre></pre>');
                if (addWait) {
                    $('#out pre:last-child').addClass('cursor').text('_');
                }
                clearInterval(charOut);
                resolve();
            };
        }, 150);
    });
    return promise;
}
function printMessages(msg, callback) {
    if (msg.length) {
        var wait = (msg[0].timeout > 0);
        sysOut(msg[0].msg, msg[0].color, wait).then(function() {
            setTimeout(function() {
                printMessages(msg.slice(1, msg.length), callback);
            }, msg[0].timeout);
        });
    } else {
        if (callback) {
            callback();
        }
        $('#txt').removeAttr('disabled').focus();
    }
}
function txtareaSize() {
    $('#txt').width($('#in').width() - $('.path').width() - 20);
}
