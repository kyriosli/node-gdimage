// process.env.GDFONTPATH = __dirname + ':/Library/Fonts';
run('fonts.js');
run('shape.js');


function run(script) {
    require('./' + script);
}
