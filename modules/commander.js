//Constants
const DEBUG = process.env.NODE_ENV != 'production';

//Modules
const util = require('util');
const EventEmitter = require('events');

function commander() {
    //Call constructor
    EventEmitter.call(this);

    //Hold instance, so it can be used in private functions
    var instance = this;

    //Console reader
    const rl = require('readline').createInterface(process.stdin, process.stdout);

    this.begin = function () {
        rl.setPrompt('');
        rl.on('line', onCommand);
        rl.on('close', onExit);
        rl.prompt();
    }

    this.exit = function () {
        rl.close();
    }

    function getParts(line) {
        const matchParts = /["](.+?[^\\])["]|(\S+)/g;
        var partsM = matchParts.exec(line);
        var parts = [];

        while (partsM != null) {
            //Process the match
            var txt = partsM[1] || partsM[0];
            txt = txt.replace('\\"', '"').trim();

            if (txt.length > 0)
                parts.push(txt);

            //Got to the next match
            partsM = matchParts.exec(line);
        }

        return parts;
    }

    function onCommand(line) {
        //Clean-up
        line = line.trim();
        //Exit on empty line
        if (line.length == 0) return;
        //Get command parts (slice by space)
        var parts = getParts(line);

        if (parts.length > 0) {
            instance.emit('command', {
                cmd: parts[0],
                args: parts.slice(1),
                raw: line
            });
        }
    }

    function onExit() {
        instance.emit('exit');
    }
}

util.inherits(commander, EventEmitter);

module.exports = new commander;