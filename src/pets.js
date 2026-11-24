const tiles = [...document.querySelectorAll('.pet-tile')];
    const descTitle = document.getElementById('descTitle');
    const descBody = document.getElementById('descBody');
    const search = document.getElementById('petSearch');

    // Click a tile -> highlight it and fill the description box
    tiles.forEach((tile) => {
      tile.addEventListener('click', () => {
        tiles.forEach((t) => t.classList.remove('is-selected'));
        tile.classList.add('is-selected');

        descTitle.textContent = tile.dataset.name;
        descTitle.classList.add('has-pet');
        descBody.textContent = tile.dataset.desc;
      });
    });

    // Search filters tiles by name
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      tiles.forEach((tile) => {
        const match = tile.dataset.name.toLowerCase().includes(q);
        tile.parentElement.hidden = !match;
      });
    });