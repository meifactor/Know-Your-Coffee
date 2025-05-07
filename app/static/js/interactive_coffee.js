// static/js/interactive_coffee.js
$(document).ready(function () {
  let coffeeData = [];
  let currentIndex = 0;
  const $coffeeData = $("#coffee-data");
  const $popup = $("#popup");
  const $continue = $("#continue-btn");
  const $progressDots = $("#progress-dots");
  const $completionMessage = $("#completion-message");
  let viewedBeverages = new Set();
  const $buttonRow = $('#beverage-button-row');

  // --- NEW LOGIC: Button Row for Each Beverage ---
  function renderButtonRow() {
    if (completed) return; // Prevent tan background from coming back after completion
    $buttonRow.empty();
    coffeeData.forEach((coffee, idx) => {
      const $btn = $(`<button class="beverage-btn" id="bev-btn-${idx}">${coffee.name}</button>`);
      if (viewedBeverages.has(idx)) $btn.addClass('clicked');
      $btn.on('click', function () {
        if (completed) return; // Prevent any action after completion
        if (!viewedBeverages.has(idx)) {
          viewedBeverages.add(idx);
          $btn.addClass('clicked');
        }
        currentIndex = idx;
        renderCoffee(idx);
        updateContinueBtn();
      });
      $buttonRow.append($btn);
    });
    updateContinueBtn();
  }

  function updateContinueBtn() {
    if (viewedBeverages.size === coffeeData.length) {
      $continue.text('Continue')
        .removeAttr('href')
        .css({ 'pointer-events': 'auto', 'opacity': 1 })
        .attr('tabindex', 0)
        .off('click')
        .on('click', function(e) {
          e.preventDefault();
          showCompletionMessage();
        });
    } else {
      $continue.text('View all components to continue')
        .attr('href', '#')
        .css({ 'pointer-events': 'none', 'opacity': 0.6 })
        .attr('tabindex', -1);
    }
  }

  // No longer needed: function checkAllViewed() { ... }

  // Removed progress dots logic (initializeProgressDots, updateProgressDots)
  

  // Show completion message
  let completed = false;
  function showCompletionMessage() {
    $completionMessage.fadeIn();
    $('.coffee-section').hide();
    completed = true;
  }

  // Restart the lesson
  function restartLesson() {
    currentIndex = 0;
    viewedBeverages = new Set();
    $completionMessage.fadeOut();
    $('.coffee-section').show();
    completed = false;
    renderButtonRow();
    renderCoffee(0);
  }

  // helper for popup
  function showPopup(el, info) {
    const offset = $(el).offset();
    
    // Calculate position
    let left = offset.left + $(el).outerWidth() + 10;
    let top = offset.top;
    
    // Ensure popup stays within viewport
    const popupWidth = 300;
    const popupHeight = 100;
    const windowWidth = $(window).width();
    const windowHeight = $(window).height();
    
    if (left + popupWidth > windowWidth) {
      left = offset.left - popupWidth - 10;
      $popup.removeClass('left-arrow').addClass('right-arrow');
    } else {
      $popup.removeClass('right-arrow').addClass('left-arrow');
    }
    
    if (top + popupHeight > windowHeight) {
      top = windowHeight - popupHeight - 20;
    }
    
    $popup
      .html(`<div class="popup-content">${info}</div>`)
      .css({
        top: top + "px",
        left: left + "px"
      })
      .show()
      .addClass('show');
  }

  function hidePopup() {
    $popup.removeClass('show');
    setTimeout(() => $popup.hide(), 300);
  }

  function renderCoffee(index) {
    if (completed) return; // Never show tan background after completion
    currentIndex = index;
    const coffee = coffeeData[index];
    const hotspots = coffee.hotspots || [];
    $("#coffee-name").text(coffee.name);

    // Visually update button row
    $buttonRow.find('button').removeClass('clicked');
    $(`#bev-btn-${index}`).addClass('clicked');
    viewedBeverages.add(index);

    $coffeeData.html(`<div class="image-container"></div>`);
    const $container = $coffeeData.find(".image-container");

    // Load SVG
    fetch(coffee.image)
      .then(response => response.text())
      .then(svgData => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgData, 'image/svg+xml');
        const svg = doc.documentElement;
        
        svg.classList.add('img-fluid');
        svg.setAttribute('width', '500');
        svg.setAttribute('height', '500');
        
        $container.html(svg);

        let clickedCount = 0;
        const total = hotspots.length;

        hotspots.forEach(hs => {
          let $region;
          if (hs.fillColor.startsWith("url(")) {
            const gradientId = hs.fillColor.match(/#[^)]+/)[0];
            $region = $(svg).find(`[fill="${hs.fillColor}"], [style*="${hs.fillColor}"], path[fill*="${gradientId}"]`);
          } else {
            $region = $(svg).find(`[fill="${hs.fillColor}"]`);
          }

          if ($region.length > 0) {
            $region
              .addClass("hotspot")
              .data("clicked", false)
              .data("info", hs.info);

            $region.on("click", function(e) {
              e.stopPropagation();
              showPopup(this, $(this).data("info"));

              if (!$region.data("clicked")) {
                $region.data("clicked", true);
                clickedCount++;

                if (clickedCount === total) {
                  $continue.prop("disabled", false);
                }
              }
            });

            $region.hover(
              function() {
                $(this).addClass("pulse-animation");
              },
              function() {
                $(this).removeClass("pulse-animation");
              }
            );
          }
        });
      })
      .catch(error => {
        console.error('Error loading SVG:', error);
        $coffeeData.html(`<p class='text-danger'>Failed to load image: ${coffee.name}</p>`);
      });
  }

  // Override Continue button: show completion message if all viewed
  function continueButtonHandler() {
    if ($continue.prop('disabled') || viewedBeverages.size !== coffeeData.length) return;
    showCompletionMessage();
  }

  // Hide popup on outside click
  function hidePopupHandler() {
    hidePopup();
  }

  // Restart button click event
  function restartLessonHandler() {
    restartLesson();
  }

  // Initial load
  $.getJSON("/learn/beverages/data", function (data) {
    coffeeData = data;
    if (coffeeData.length) {
      renderButtonRow();
      renderCoffee(0); // Always show the first coffee immediately
    }
  }).fail(function (error) {
    console.error('Error loading coffee data:', error);
    $coffeeData.html("<p class='text-danger'>Failed to load coffee data.</p>");
  });

  // Event listeners
  $continue.off('click').on('click', continueButtonHandler);
  $(document).on("click", hidePopupHandler);
  $('#restart-btn').on('click', restartLessonHandler);
});