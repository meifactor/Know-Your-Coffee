$(document).ready(function () {
  let coffeeData = [];
  let currentIndex = 0;
  const $coffeeData = $("#coffee-data");
  const $popup      = $("#popup");
  const $continue   = $("#continue-btn");

  // helper for popup
  function showPopup(el, info) {
    const offset = $(el).offset();
    $popup
      .text(info)
      .css({
        top:  offset.top  + "px",
        left: offset.left + $(el).outerWidth() + "px"
      })
      .show();
  }

  function renderCoffee(index) {
    currentIndex = index;
    const coffee   = coffeeData[index];
    const hotspots = coffee.hotspots || [];

    // reset Continue button
    $continue
      .prop("disabled", true)
      .removeClass("enabled")
      .css({});

    $coffeeData.html(`<div class="image-container"></div>`);
    const $container = $coffeeData.find(".image-container");

    $.get(coffee.image, function(svgData) {
      const $svg = $(svgData).find("svg")
        .addClass("img-fluid")
        .attr({ width: 500, height: 500 });

      $container.html($svg);

      let clickedCount = 0;
      const total = hotspots.length;

      hotspots.forEach(hs => {
        const $region = $svg
          .find(`[fill="${hs.fillColor}"]`)
          .addClass("hotspot")
          .data("clicked", false);

        $region.on("click", function(e) {
          e.stopPropagation();
          showPopup(this, hs.info);

          if (!$region.data("clicked")) {
            $region.data("clicked", true);
            clickedCount++;

            if (clickedCount === total) {
              // enable Continue
              $continue
                .prop("disabled", false)
                .addClass("enabled");
            }
          }
        });

        $region.hover(
          () => $region.addClass("pulse-animation"),
          () => $region.removeClass("pulse-animation")
        );
      });
    });
  }

  // advance when enabled
  $continue.on("click", () => {
    if ($continue.prop("disabled") || !coffeeData.length) return;
    $popup.hide();
    renderCoffee((currentIndex + 1) % coffeeData.length);
  });

  // hide popup on outside click
  $(document).on("click", () => $popup.hide());

  // initial load
  $.getJSON("/learn/beverages/data", function (data) {
    coffeeData = data;
    if (coffeeData.length) renderCoffee(0);
  }).fail(function () {
    $coffeeData.html("<p class='text-danger'>Failed to load coffee data.</p>");
  });
});
