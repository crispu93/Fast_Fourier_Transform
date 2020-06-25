// For manipulation and visualization of audio, it is based on 
// https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/
//var Wavefile = new wavefile.WaveFile();
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
let currentBuffer = null;
const { Complex } = window;
//let fileName = 'heroes(mono).wav';
let fileName = 'audiocheck.net_whitenoise.wav';
let sampleSize = 32768/2;
//let sampleSize = 8192;
var audioCtx = new AudioContext();
var myBuffer = audioCtx.createBuffer(1, sampleSize, 44100);
var nowBuffer = myBuffer.getChannelData(0);

const drawAudio = url => {
    fetch (url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {draw('before', normalizeData(filterData(audioBuffer)));
        
        let newAudioBuffer =  FFT(filterData(audioBuffer));
        
        let audBuff = iFFT(newAudioBuffer);
        
        draw('after', normalizeData(audBuff));

        for (var i = 0; i< myBuffer.length; i++){
            //nowBuffer[i] = filterData(audioBuffer)[i];
            nowBuffer[i] = audBuff[i].toFixed(4)
        }
        console.log(filterData(audioBuffer));
        console.log(audBuff);

        var source = audioCtx.createBufferSource();
        source.buffer = myBuffer;
        source.connect(audioCtx.destination);
        source.start();
        /*let wav = new wavefile.WaveFile();
 
        // Create a mono wave file, 44.1 kHz, 32-bit and 4 samples
        wav.fromScratch(1, 44100, '16', filterData(audioBuffer));
        //fs.writeFileSync("new.wav", wav.toBuffer());
        var audio = new Audio(wav.toBuffer());
        audio.play();*/
    });

};

const filterData = audioBuffer => {
    const rawData = audioBuffer.getChannelData(0);
    const samples = sampleSize;
    //const blockSize = Math.floor(rawData.length/samples);
    const filteredData = [];
    for(let i = 0; i < samples; i++) {
        filteredData.push(rawData[i].toFixed(4));
    }
    return filteredData;
};

const normalizeData = filteredData => {
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    return filteredData.map(n => n*multiplier);  
};

const draw = (id, normalizedData) => {
    const canvas = document.getElementById(id);
    const dpr = window.devicePixelRatio || 1;
    const padding = 20;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.translate(0, canvas.offsetHeight / 2 + padding);

    const width = canvas.offsetWidth / normalizedData.length;
    for (let i = 0; i < normalizedData.length; i++) {
        const x = width * i;
        let height = normalizedData[i] * canvas.offsetHeight - padding;
        if (height < 0) {
            height = 0;
        } else if (height > canvas.offsetHeight / 2) {
            height = height > canvas.offsetHeight / 2;
        }
        drawLineSegment(ctx, x, height, width, (i + 1) % 2);
    }
};

const drawLineSegment = (ctx, x, y, width, isEven) => {
    ctx.lineWidth = 1; // how thick the line is
    ctx.strokeStyle = "#fff"; // what color our line is
    ctx.beginPath();
    y = isEven ? y : -y;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, y);
    ctx.arc(x + width / 2, y, width / 2, Math.PI, 0, isEven);
    ctx.lineTo(x + width, 0);
    ctx.stroke();
};

function FFT(arr) {
    let n = arr.length;
    if (n == 1)
        return arr;
    
    let even = [], odd = [], 
        x1, x2,
        y = new Array(n);

    for (let i = 0; i < n; i++) {
        if (i % 2)
            odd.push(arr[i]);   
        else
            even.push(arr[i]);
    }

    x1 = FFT(even);
    x2 = FFT(odd);
    for (let k = 0; k <= n/2-1; k++) {
        let arg = -1*2*Math.pi*k/n;
        let w = Complex(Math.cos(arg), Math.sin(arg));
        y[k] = w.mul(x2[k]).add(x1[k]);
        y[n/2 + k] = Complex(x1[k]).sub(w.mul(x2[k]));
        //console.log(arg);
        //let w = math.complex(math.cos(arg), math.sin(arg)); // Euler's formula 
        //y[k] = math.add(math.multiply(w, x2[k]), x1[k]);
        //y[n/2 + k] = math.subtract(x1[k], math.multiply(w, x2[k]));
    }
    return y;
}

/*function iFFT(arr) {
    let n = arr.length;
    if (n == 1)
        return arr;

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

    for (let k = 0; k <= n/2-1; k++) {
        let arg = 2*math.pi*k/n;
        console.log(arg);
        let w = math.complex(math.cos(arg), math.sin(arg)); // Euler's formula 
        y[k] = math.add(math.multiply(w, x2[k]), x1[k]);
        y[k] = math.divide(y[k], n);
        y[n/2 + k] = math.divide(math.subtract(x1[k], math.multiply(x2[k], w)), n);
    }

    return y;
}*/

//drawAudio(fileName);
console.log(FFT([1,1,1,1]));