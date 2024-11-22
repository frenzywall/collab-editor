class LoadingScreenController {
    constructor() {
      this.loadingScreen = document.getElementById('loading-screen');
      this.steps = document.querySelectorAll('.step');
      this.currentStep = 0;
      this.loadingDuration = 3000; // 3 seconds for the entire animation
      this.stepDuration = this.loadingDuration / this.steps.length;
    }
  
    init() {
      this.animateSteps();
      this.setHideTimer();
    }
  
    animateSteps() {
      // Start step animation sequence
      this.steps.forEach((step, index) => {
        setTimeout(() => {
          this.updateActiveStep(index);
        }, index * this.stepDuration);
      });
    }
  
    updateActiveStep(index) {
      // Remove active class from all steps
      this.steps.forEach(step => step.classList.remove('active'));
      // Add active class to the current step
      if (this.steps[index]) {
        this.steps[index].classList.add('active');
      }
    }
  
    setHideTimer() {
      // Hide loading screen after duration
      setTimeout(() => {
        this.hideLoadingScreen();
      }, this.loadingDuration);
    }
  
    hideLoadingScreen() {
      this.loadingScreen.style.opacity = '0';
      setTimeout(() => {
        this.loadingScreen.style.display = 'none';
      }, 500); // Wait for fade-out animation
    }
  }
  
  // Initialize loading screen when window loads
  window.onload = function () {
    const loadingScreen = new LoadingScreenController();
    loadingScreen.init();
  };
  