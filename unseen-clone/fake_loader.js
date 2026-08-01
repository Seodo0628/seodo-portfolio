(function() {
  // Wait for theme.js to load
  function waitForTheme() {
    var check = setInterval(function() {
      if (window.store && window.store.GlobalEvents) {
        clearInterval(check);
        simulateProgress(window.store.GlobalEvents);
      }
    }, 100);
    
    // Fallback: if theme.js doesn't load in 3 seconds, directly manipulate DOM
    setTimeout(function() {
      clearInterval(check);
      directDOMFix();
    }, 3000);
  }
  
  function simulateProgress(eventBus) {
    if (!eventBus) return;
    
    var progress = 0;
    var interval = setInterval(function() {
      progress += Math.random() * 20 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        eventBus.emit('AssetsProgress', { percent: 100 });
        setTimeout(function() {
          eventBus.emit('AssetLoader:afterResolve');
        }, 300);
      } else {
        eventBus.emit('AssetsProgress', { percent: Math.floor(progress) });
      }
    }, 150);
  }
  
  function directDOMFix() {
    var progressEl = document.querySelector('.js-loader-progress');
    var progressInnerEl = document.querySelector('.js-loader-progress-inner');
    
    if (progressEl) {
      progressEl.style.transform = 'translateY(0%)';
    }
    if (progressInnerEl) {
      progressInnerEl.style.transform = 'translateY(0%)';
    }
    
    setTimeout(function() {
      var loader = document.querySelector('.js-loader');
      if (loader) {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
      }
    }, 500);
  }
  
  waitForTheme();
  setTimeout(directDOMFix, 2000);
})();
 (function() {
   // 等待 theme.js 加载完成后执行
   function forceLoaderComplete() {
     var loader = document.querySelector('.js-loader');
     var progress = document.querySelector('.js-loader-progress');
     var progressInner = document.querySelector('.js-loader-progress-inner');
     
     if (!loader) return false;
     
     // 强制进度条完成
     if (progress) {
       progress.style.transform = 'translateY(0%)';
       progress.style.transition = 'transform 0.5s ease-out';
     }
     if (progressInner) {
       progressInner.style.transform = 'translateY(0%)';
       progressInner.style.transition = 'transform 0.5s ease-out';
     }
     
     // 移除动画类，防止持续旋转
     loader.classList.remove('loader--animate');
     
     // 延迟后隐藏 loader
     setTimeout(function() {
       loader.style.opacity = '0';
       loader.style.transition = 'opacity 0.5s ease';
       setTimeout(function() {
         loader.style.display = 'none';
       }, 500);
     }, 800);
     
     return true;
   }
   
   // 等待 DOM 和 theme.js 加载
   if (document.readyState === 'loading') {
     document.addEventListener('DOMContentLoaded', function() {
       setTimeout(forceLoaderComplete, 100);
     });
   } else {
     setTimeout(forceLoaderComplete, 100);
   }
 })();
