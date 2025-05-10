$(document).ready(function() {
  // state
  let coffeeData = [];
  let currentIndex = 0;

  // cache the container that actually has our buttons
  const $coffeeContainer = $("#coffee-container").last();
  const $coffeeData      = $coffeeContainer.find("#coffee-data");
  const $popup           = $coffeeContainer.find("#popup");
  const $backBtn         = $coffeeContainer.find("#back-btn");
  const $continueBtn     = $coffeeContainer.find("#continue-btn");
  const $progressDots    = $("#progress-dots");
  const $completionScreen= $("#completion-screen");
  const $restartDrinks   = $("#restart-drinks");
  const $coffeeTitle     = $(".coffee-title#coffee-name");
  const $drinkName       = $("#drink-name");

  // build the little circles up top
  function initializeProgressDots() {
    $progressDots.empty();
    coffeeData.forEach((_, idx) => {
      $progressDots.append(`<div class="progress-dot" data-index="${idx}"></div>`);
    });
    updateProgressDots();
  }

  function updateProgressDots() {
    $progressDots.find(".progress-dot").each(function(idx) {
      $(this).toggleClass("completed", idx <= currentIndex);
    });
  }

  function updateNavButtons() {
    $backBtn.prop("disabled", currentIndex === 0);
  }

  // position & show the little info popup
  function showPopup(el, info) {
    const rect = el.getBoundingClientRect();
    const { left: cx, top: cy } = $coffeeContainer.offset();
    const cw = $coffeeContainer.width();

    let left = rect.left + rect.width + 10;
    let top  = rect.top + rect.height/2 - 50;

    const popupW = 300, popupH = 100;
    const ww = $(window).width(), wh = $(window).height();

    if (left + popupW > ww || left < cx + cw) {
      left = rect.left - popupW - 10;
      $popup.removeClass("left-arrow").addClass("right-arrow");
    } else {
      $popup.removeClass("right-arrow").addClass("left-arrow");
    }

    if (top + popupH > wh) top = wh - popupH - 20;
    if (top < 0) top = 20;

    $popup
      .html(`<div class="popup-content">${info}</div>`)
      .css({ top: `${top}px`, left: `${left}px` })
      .show()
      .addClass("show");
  }

  function hidePopup() {
    $popup.removeClass("show");
    setTimeout(() => $popup.hide(), 300);
  }

  // fade out the lesson, fade in the overlay
  function showCompletionScreen() {
    hidePopup();
    $(".coffee-section").fadeOut(300);
    $completionScreen.fadeIn(300);
  }

  function hideCompletionScreen() {
    $completionScreen.fadeOut(300);
    $(".coffee-section").fadeIn(300);
  }

  // load one coffee SVG + hotspots
  function renderCoffee(index) {
    currentIndex = index;
    const coffee = coffeeData[index];

    $coffeeTitle.text(coffee.name);
    $drinkName.text(coffee.name.toLowerCase());
    $continueBtn.prop("disabled", true).removeClass("enabled");
    updateNavButtons();

    $coffeeData.empty();
    fetch(coffee.image)
      .then(r => r.text())
      .then(svgText => {
        const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
        const svg = doc.documentElement;
        svg.classList.add("img-fluid");
        $coffeeData.html(svg);

        let clickedCount = 0;
        const total = (coffee.hotspots || []).length;

        (coffee.hotspots || []).forEach(hs => {
          let $region;
          if (hs.fillColor.startsWith("url(")) {
            const gradientId = hs.fillColor.match(/#[^)]+/)[0];
            $region = $(svg).find(
              `[fill="${hs.fillColor}"], [style*="${hs.fillColor}"], path[fill*="${gradientId}"]`
            );
          } else {
            $region = $(svg).find(`[fill="${hs.fillColor}"]`);
          }

          if (!$region.length) return;
          $region
            .addClass("hotspot")
            .data("clicked", false)
            .data("info", hs.info)
            .on("click", function(e) {
              e.stopPropagation();
              showPopup(this, $(this).data("info"));
              if (!$(this).data("clicked")) {
                $(this).data("clicked", true);
                clickedCount++;
                if (clickedCount === total) {
                  $continueBtn.prop("disabled", false).addClass("enabled");
                }
              }
            })
            .hover(
              function() { $(this).addClass("pulse-animation"); },
              function() { $(this).removeClass("pulse-animation"); }
            );
        });
      })
      .catch(err => {
        console.error("Error loading SVG:", err);
        $coffeeData.html(`<p class="text-danger">Failed to load image: ${coffee.name}</p>`);
      });

    updateProgressDots();
  }

  // next
  $continueBtn.on("click", function(e) {
    e.stopPropagation();
    if (this.disabled || !coffeeData.length) return;
    hidePopup();
    if (currentIndex === coffeeData.length - 1) {
      showCompletionScreen();
    } else {
      renderCoffee(currentIndex + 1);
    }
  });

  // back
  $backBtn.on("click", function(e) {
    e.stopPropagation();
    if (currentIndex > 0) {
      hidePopup();
      renderCoffee(currentIndex - 1);
    }
  });

  // restart from overlay
  $restartDrinks.on("click", function() {
    hideCompletionScreen();
    currentIndex = 0;
    initializeProgressDots();
    renderCoffee(0);
  });

  // clicking outside popup hides it
  $(document).on("click", function(e) {
    if (!$(e.target).closest($popup).length) {
      hidePopup();
    }
  });

  // initial data load
  $.getJSON("/learn/beverages/data")
    .done(data => {
      coffeeData = data;
      if (coffeeData.length) {
        initializeProgressDots();
        renderCoffee(0);
      }
    })
    .fail(err => {
      console.error("Error loading coffee data:", err);
      $coffeeData.html("<p class='text-danger'>Failed to load coffee data.</p>");
    });
});