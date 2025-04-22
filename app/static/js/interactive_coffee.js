$(document).ready(function () {
    let coffeeData = [];
    let currentIndex = 0;
    const $coffeeData = $("#coffee-data");
    const $popup = $("#popup");
  
    function renderCoffee(index) {
      const coffee = coffeeData[index];
      const hotspots = coffee.hotspots || [];
  
      $coffeeData.html(`
        <div class="text-center">
          <h4>${coffee.name}</h4>
          <div class="image-container">
            <img src="${coffee.image}" alt="${coffee.name}" class="img-fluid mb-3">
          </div>
          <p>${coffee.description}</p>
          <button id="continue-btn" class="btn btn-primary">Continue</button>
        </div>
      `);
  
      const $container = $coffeeData.find(".image-container");
      hotspots.forEach(hs => {
        const $hot = $('<div class="hotspot"></div>')
          .css({ top: hs.y + 'px', left: hs.x + 'px' })
          .attr('data-info', hs.info);
        $container.append($hot);
      });
    }
  
    // Show popup next to hotspot
    $(document).on('click', '.hotspot', function (e) {
      e.stopPropagation();
      const info = $(this).data('info');
      const offset = $(this).offset();
      $popup
        .text(info)
        .css({
          top: offset.top + 'px',
          left: offset.left + $(this).outerWidth() + 'px'
        })
        .show();
    });
  
    // Hide popup on outside click
    $(document).on('click', () => {
      $popup.hide();
    });
  
    // Load data and render first item
    $.getJSON("/learn/beverages/data", function (data) {
      coffeeData = data;
      renderCoffee(currentIndex);
    }).fail(function () {
      $coffeeData.html("<p class='text-danger'>Failed to load coffee data.</p>");
    });
  
    // Continue button handler
    $coffeeData.on("click", "#continue-btn", function () {
      if (currentIndex < coffeeData.length - 1) {
        currentIndex++;
        renderCoffee(currentIndex);
      } else {
        $coffeeData.html("<h4 class='text-center'>You're done!</h4>");
      }
    });
  });
  