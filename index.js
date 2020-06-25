// For manipulation and visualization of audio, it is based on 
// https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/
//var Wavefile = new wavefile.WaveFile();
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
let currentBuffer = null;

let fileName = 'pcm1608m.wav';
//let fileName = 'audiocheck.net_whitenoise.wav';
let sampleSize = 32768*2;
//let sampleSize = 8192;
//let sampleSize = 2048;
var audioCtx = new AudioContext();
var myBuffer = audioCtx.createBuffer(1, sampleSize, 8000);
var nowBuffer = myBuffer.getChannelData(0);

const drawAudio = url => {
    fetch (url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
        let aux = filterData(audioBuffer)
        draw('before', normalizeData(aux));
        let audBuff =  iFFT(FFT(aux));
        audBuff = audBuff.map(x => x*audBuff.length);
        draw('after', normalizeData(audBuff));
        for (var i = 0; i< myBuffer.length; i++){
            nowBuffer[i] = aux[i];
        }
        console.log(nowBuffer);

        // Playing generated
        var source = audioCtx.createBufferSource();
        source.buffer = myBuffer;
        source.connect(audioCtx.destination);
        source.start();
    });

};

const filterData = audioBuffer => {
    const rawData = audioBuffer.getChannelData(0);
    const samples = sampleSize;
    const filteredData = [];
    for(let i = 0; i < samples; i++) {
        filteredData.push(rawData[i]);
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
        let arg = -1*2*math.pi*k/n;
        let w = math.complex(math.cos(arg), math.sin(arg)); // Euler's formula 
        y[k] = math.add(math.multiply(w, x2[k]), x1[k]);
        y[n/2 + k] = math.subtract(x1[k], math.multiply(w, x2[k]));
        /*if (isNearZero(y[k].re))
            y[k].re = 0;
        if (isNearZero(y[k].im))
            y[k].im = 0;
        if (isNearZero(y[n/2 + k].re))
            y[n/2 + k].re = 0;
        if (isNearZero(y[n/2 + k].im))
            y[n/2 + k].im = 0;*/
    }
    return y;
}

function iFFT(arr) {
    let n = arr.length;
    if (n == 1)
        return arr;

    let even = [], odd = [], 
        x1 = [], x2 = [],
        y = new Array(n);

    for (let i = 0; i < n; i++) {
        if (i % 2 == 1)
            odd.push(arr[i]);
        else
            even.push(arr[i]);
    }

    x1   = iFFT(even);
    x2 = iFFT(odd);

    for (let k = 0; k <= n/2-1; k++) {
        let arg = 2*Math.PI*k/n;
        let w = math.complex(math.cos(arg), math.sin(arg)); // Euler's formula 
        w = math.inv(w);
        y[k] = math.add(math.multiply(w, x2[k]), x1[k]);
        y[k] = math.multiply(y[k], math.inv(n)).re;
        let r =math.multiply(x2[k], w);
        y[n/2 + k] = math.multiply(math.subtract(x1[k], r), math.inv(n)).re;
        
        /*if (isNearZero(y[k].re))
            y[k].re = 0;
        if (isNearZero(y[k].im))
            y[k].im = 0;
        if (isNearZero(y[n/2 + k].re))
            y[n/2 + k].re = 0;
        if (isNearZero(y[n/2 + k].im))
            y[n/2 + k].im = 0;*/
        /*if (isNearZero(y[k]))
            y[k] = 0;
        if (isNearZero(y[n/2 + k]))
            y[n/2 + k] = 0;*/
    }
    return y;
}

function isNearZero(number){
    if (Math.abs(number) < 1e-10)
        return true;
    else
        false;
}

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

drawAudio(fileName);
let len = 8;
console.log(iFFT(FFT([8,8,8,8,8,8,8,8])).map(x=>x*len));