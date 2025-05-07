// static/js/interactive_coffee.js
$(document).ready(function () {
  let coffeeData = [];
  let currentIndex = 0;
  const $coffeeData = $("#coffee-data");
  const $popup = $("#popup");
  const $continue = $("#continue-btn");
  const $progressDots = $("#progress-dots");
  const $completionMessage = $("#completion-message");

  // Initialize progress dots
  function initializeProgressDots() {
    $progressDots.empty();
    coffeeData.forEach((_, index) => {
      $progressDots.append(`<div class="progress-dot" data-index="${index}"></div>`);
    });
    updateProgressDots();
  }

  // Update progress dots based on current index
  function updateProgressDots() {
    $progressDots.find('.progress-dot').each(function(index) {
      if (index < currentIndex) {
        $(this).addClass('completed');
      } else if (index === currentIndex) {
        $(this).addClass('completed');
      } else {
        $(this).removeClass('completed');
      }
    });
  }

  // Show completion message
  function showCompletionMessage() {
    $completionMessage.fadeIn();
    $('.coffee-section').fadeOut();
  }

  // Restart the lesson
  $('#restart-btn').on('click', function() {
    currentIndex = 0;
    $completionMessage.fadeOut();
    $('.coffee-section').fadeIn();
    renderCoffee(0);
  });

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
    currentIndex = index;
    const coffee = coffeeData[index];
    const hotspots = coffee.hotspots || [];
    $("#coffee-name").text(coffee.name);

    // Reset Continue button
    $continue.prop("disabled", true);

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

  // Advance when enabled
  $continue.on("click", () => {
    if ($continue.prop("disabled") || !coffeeData.length) return;
    $popup.hide();
    
    if (currentIndex === coffeeData.length - 1) {
      showCompletionMessage();
    } else {
      renderCoffee(currentIndex + 1);
    }
    updateProgressDots();
  });

  // Hide popup on outside click
  $(document).on("click", () => hidePopup());

  // Initial load
  $.getJSON("/learn/beverages/data", function (data) {
    coffeeData = data;
    if (coffeeData.length) {
      initializeProgressDots();
      renderCoffee(0);
    }
  }).fail(function (error) {
    console.error('Error loading coffee data:', error);
    $coffeeData.html("<p class='text-danger'>Failed to load coffee data.</p>");
  });
});