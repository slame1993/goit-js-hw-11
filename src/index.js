import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchResult } from './fetchResult';

const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  infoForUser: document.querySelector('.info-for-user'),
  loader: document.querySelector('.loader'),
  observerElement: document.querySelector('.observer-element'),
  btn: document.getElementsByName('btn-submit'),
};

let currentHits = 0;
let page = 1;
let searchWord = '';

refs.searchForm.addEventListener('submit', handleSubmit);

async function handleSubmit(event) {
  event.preventDefault();
  searchWord = event.currentTarget
    .querySelector('[name="searchQuery"]')
    .value.trim();
  observer.observe(refs.observerElement);
  console.log(refs.observerElement);
  currentHits = 0;
  page = 1;

  if (searchWord === '') {
    refs.loader.classList.add('is-hidden');
    refs.infoForUser.classList.add('is-hidden');
    refs.gallery.innerHTML = '';
    return Notiflix.Notify.info('Please, enter at least one letter!');
  }

  try {
    const searchObjects = await fetchResult(searchWord, page);
    const selectHits = searchObjects.hits.length;
    currentHits += selectHits;
    console.log(currentHits, searchObjects.totalHits);

    if (searchObjects.hits.length === 0) {
      observer.unobserve(refs.observerElement);
      refs.loader.classList.add('is-hidden');
      refs.infoForUser.classList.add('is-hidden');
      refs.gallery.innerHTML = '';
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again or try another word.'
      );
    }

    Notiflix.Notify.info(`Hooray! We found ${searchObjects.totalHits} images.`);
    let hits = searchObjects.hits;
    refs.gallery.innerHTML = Markup(hits);
    let simpleLightBox = new SimpleLightbox('.gallery a', {
      captions: false,
    });
    refs.btn[0].disabled = true;
    refs.btn[0].classList.add('btn-submit');
    refs.loader.classList.remove('is-hidden');
    refs.loader.classList.add('loader');
    refs.searchForm.addEventListener('input', inputChange);

    if (currentHits < searchObjects.totalHits) {
      observer.observe(refs.observerElement);
    }

    if (currentHits === searchObjects.totalHits) {
      scrollFunction();
      observer.unobserve(refs.observerElement);
      refs.loader.classList.add('is-hidden');
      refs.infoForUser.classList.remove('is-hidden');
    }
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Sorry, there was an error. Please try again.');
  }
}

function inputChange() {
  refs.btn[0].disabled = false;
  refs.btn[0].classList.remove('btn-submit');
}

const observer = new IntersectionObserver(handleScrollToBottom, {
  rootMargin: '100px',
});

async function handleScrollToBottom(entries) {
  for (const entry of entries) {
    try {
      if (entry.isIntersecting && searchWord !== '') {
        page += 1;
        const searchObjects = await fetchResult(searchWord, page);
        const selectHits = searchObjects.hits.length;
        currentHits += selectHits;
        console.log(searchObjects.totalHits);
        console.log(entry.isIntersecting);
        refs.infoForUser.classList.add('is-hidden');
        let hits = searchObjects.hits;
        refs.gallery.innerHTML += Markup(hits);
        let simpleLightBox = new SimpleLightbox('.gallery a', {
          captions: false,
        });

        simpleLightBox.refresh();
        pageScroll();

        if (searchObjects.totalHits === currentHits) {
          console.log(entry.isIntersecting);
          refs.loader.disabled = true;
          refs.loader.classList.remove('loader');
          refs.loader.classList.add('is-hidden');
          refs.infoForUser.classList.remove('is-hidden');
          observer.unobserve(refs.observerElement);
        }
      }
    } catch (error) {
      Notiflix.Notify.failure(
        '444 Sorry, there was an error loading more images. Please try again.'
      );
    }
  }
}

observer.observe(refs.observerElement);

function Markup(hits) {
  return hits
    .map(image => {
      return `<div class="photo-card">
                <a href="${image.largeImageURL}">
                    <img class="photo" src="${image.webformatURL}" alt="${image.tags}" title="${image.tags}" loading="lazy"/>
                </a>
                <div class="info">
                    <p class="info-item">
                        <b>Likes</b> <span class="info-item-api"> ${image.likes} </span>
                    </p>
                    <p class="info-item">
                        <b>Views</b> <span class="info-item-api">${image.views}</span>
                    </p>
                    <p class="info-item">
                        <b>Comments</b> <span class="info-item-api">${image.comments}</span>
                    </p>
                    <p class="info-item">
                        <b>Downloads</b> <span class="info-item-api">${image.downloads}</span>
                    </p>
                </div>
            </div>`;
    })
    .join('');
}
