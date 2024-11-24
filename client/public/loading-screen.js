class LoadingScreenController {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.steps = document.querySelectorAll('.step');
        this.currentStep = 0;
        this.loadingDuration = 3000; 
        this.stepDuration = this.loadingDuration / this.steps.length;
    }

    init() {
        this.animateSteps();
        this.setHideTimer();
    }

    animateSteps() {
        this.steps.forEach((step, index) => {
            setTimeout(() => {
                this.updateActiveStep(index);
            }, index * this.stepDuration);
        });
    }

    updateActiveStep(index) {
        this.steps.forEach(step => step.classList.remove('active'));
        if (this.steps[index]) {
            this.steps[index].classList.add('active');
        }
    }

    setHideTimer() {
        setTimeout(() => {
            this.hideLoadingScreen();
        }, this.loadingDuration);
    }

    hideLoadingScreen() {
        this.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
        }, 500); 
    }
}

window.onload = function () {
    const loadingScreen = new LoadingScreenController();
    loadingScreen.init();
};