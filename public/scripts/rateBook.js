let ratingRange = document.getElementById('book-rating-range');
let ratingPreview = document.getElementById('rating-preview');
ratingRange.addEventListener('input', (event) => {
    console.log('ratingRange.value: ', ratingRange.value);
    ratingPreview.innerText = ratingRange.value;
});