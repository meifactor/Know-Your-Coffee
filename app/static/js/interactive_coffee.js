// static/js/interactive_coffee.js
$(document).ready(function () {
  let coffeeData = [];
  let currentIndex = 0;
  const $coffeeData = $("#coffee-data");
  const $popup      = $("#popup");
  const $continue   = $("#continue-btn");

  // helper for popup
  function showPopup(el, info) {
    const offset = $(el).offset();
    const $popup = $("#popup");
    
    // Calculate position
    let left = offset.left + $(el).outerWidth() + 10;
    let top = offset.top;
    
    // Ensure popup stays within viewport
    const popupWidth = 300; // max-width from CSS
    const popupHeight = 100; // approximate height
    const windowWidth = $(window).width();
    const windowHeight = $(window).height();
    
    // Adjust horizontal position if popup would go off-screen
    if (left + popupWidth > windowWidth) {
      left = offset.left - popupWidth - 10;
      $popup.removeClass('left-arrow').addClass('right-arrow');
    } else {
      $popup.removeClass('right-arrow').addClass('left-arrow');
    }
    
    // Adjust vertical position if popup would go off-screen
    if (top + popupHeight > windowHeight) {
      top = windowHeight - popupHeight - 20;
    }
    
    // Update popup content and position
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
    const $popup = $("#popup");
    $popup.removeClass('show');
    setTimeout(() => $popup.hide(), 300); // Wait for fade out animation
  }

  function renderCoffee(index) {
    currentIndex = index;
    const coffee   = coffeeData[index];
    const hotspots = coffee.hotspots || [];
    $("#coffee-name").text(coffee.name);

    // reset Continue button
    $continue
      .prop("disabled", true)
      .removeClass("enabled")
      .css({});

    $coffeeData.html(`<div class="image-container"></div>`);
    const $container = $coffeeData.find(".image-container");

    // Load SVG using fetch instead of $.get
    fetch(coffee.image)
      .then(response => response.text())
      .then(svgData => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgData, 'image/svg+xml');
        const svg = doc.documentElement;
        
        // Add classes and attributes
        svg.classList.add('img-fluid');
        svg.setAttribute('width', '500');
        svg.setAttribute('height', '500');
        
        // Insert the SVG
        $container.html(svg);

        let clickedCount = 0;
        const total = hotspots.length;

        hotspots.forEach(hs => {
          // Handle both gradient and solid color hotspots
          let $region;
          if (hs.fillColor.startsWith("url(")) {
            // For gradients, find elements using the gradient
            const gradientId = hs.fillColor.match(/#[^)]+/)[0];
            $region = $(svg).find(`[fill="${hs.fillColor}"], [style*="${hs.fillColor}"], path[fill*="${gradientId}"]`);
          } else {
            // For solid colors
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
                  $continue
                    .prop("disabled", false)
                    .addClass("enabled");
                }
              }
            });

            // Add hover animation
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

  // advance when enabled
  $continue.on("click", () => {
    if ($continue.prop("disabled") || !coffeeData.length) return;
    $popup.hide();
    renderCoffee((currentIndex + 1) % coffeeData.length);
  });

  // hide popup on outside click
  $(document).on("click", () => hidePopup());

  // initial load
  $.getJSON("/learn/beverages/data", function (data) {
    coffeeData = data;
    if (coffeeData.length) renderCoffee(0);
  }).fail(function (error) {
    console.error('Error loading coffee data:', error);
    $coffeeData.html("<p class='text-danger'>Failed to load coffee data.</p>");
  });
});