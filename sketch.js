let input, button, sound, analyzer;

function preload() {
    //soundFormats('mp3', 'ogg');
    sound = loadSound('heroes(mono).wav');
}

function setup() {
    let cnv = createCanvas(1200, 540);
    cnv.mousePressed(canvasPressed);
    background(220);
    text('tap here to play', 10, 20);
    analyzer = new p5.Amplitude();
    analyzer.setInput(sound);
    console.log(analyzer);
    console.log(analyzer.audiocontext.createBuffer(1,4096,44100));
    //console.log(sound);
    //console.log(FFT([1,2,3,4]));
}

function canvasPressed() {
    sound.play();
}

function draw() {
    background(220);

    // Get the average (root mean square) amplitude
    let rms = analyzer.getLevel();
    fill(127);
    stroke(0);

    // Draw an ellipse with size based on volume
    ellipse(width / 2, height / 2, 10 + rms * 200, 10 + rms * 200);
}

function FFT(arr) {
    let n = arr.length;
    if (n == 1)
        return arr[0];

    let even = [], odd = [], 
        x1 = [], x2 = [],
        y = new Array(n);

    for (let i = 0; i < n; i++) {
        if (i % 2)
            odd.push(arr[i]);
        else
            even.push(arr[i]);
    }

    x1 = FFT(even);
    x2 = FFT(odd);

    for (let k = 0; k < n/2; k++) {
        let arg = 2*math.pi*k/n;
        let w = math.complex(math.cos(arg), math.sin(arg)); // Euler's formula 
        y[k] = math.add(even[k], math.multiply(w, odd[k]));
        y[n/2 + k] = math.subtract(even[k], math.multiply(w, odd[k]));
        console.log(k + " " + n/2+k);
    }

    return y;
}

function iFFT(arr) {
    let n = arr.length;
    if (n == 1)
        return arr[0];

    let even = [], odd = [], 
        x1 = [], x2 = [],
        y = new Array(n);

    for (let i = 0; i < n; i++) {
        if (i % 2)
            odd.push(arr[i]);
        else
            even.push(arr[i]);
    }

    x1 = iFFT(even);
    x2 = iFFT(odd);

    for (let k = 0; k < n/2; k++) {
        let arg = 2*math.pi*k/n;
        let w = math.complex(math.cos(-1*arg), math.sin(-1*arg)); // Euler's formula 
        y[k] = math.divide(math.add(even[k], math.multiply(w, odd[k])), n);
        y[n/2 + k] = math.divide(math.subtract(even[k], math.multiply(w, odd[k])), n);
        console.log(k + " " + n/2+k);
    }

    return y;
}