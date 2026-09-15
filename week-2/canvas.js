// the full-viewport canvas that draws the two dividing lines -- unrelated to the chat logic

export function initCanvas() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    function drawLines() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;

        const third = canvas.width / 3;

        ctx.beginPath();
        ctx.moveTo(third, 0);
        ctx.lineTo(third, canvas.height);
        ctx.moveTo(third * 2, 0);
        ctx.lineTo(third * 2, canvas.height);
        ctx.stroke();
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawLines();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}
