import View from './View';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentEl = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentEl.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      const { goTo } = btn.dataset;

      handler(+goTo);
    });
  }
  _generateMarkup() {
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    const curPage = this._data.page;

    //1) next pages on page 1
    if (numPages > 1 && curPage === 1) {
      return `<button data-go-to=${
        curPage + 1
      } class="btn--inline pagination__btn--next">
      <span>page ${curPage + 1}</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-right"></use>
      </svg>
    </button>`;
    }

    //2) back and next to other pages
    if (numPages > 1 && curPage < numPages) {
      return `<button data-go-to=${
        curPage - 1
      } class="btn--inline pagination__btn--prev">
              <span>page ${curPage - 1}</span>
              <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
              </svg>
            </button>
            <button data-go-to=${
              curPage + 1
            } class="btn--inline pagination__btn--next">
                <span>page ${curPage + 1}</span>
                <svg class="search__icon">
                  <use href="${icons}#icon-arrow-right"></use>
                </svg>
            </button>`;
    }

    //3) back to other pages from last page
    if (numPages > 1 && curPage === numPages) {
      return `<button data-go-to=${
        curPage - 1
      } class="btn--inline pagination__btn--prev">
      <span>page ${curPage - 1}</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-left"></use>
      </svg>
    </button>`;
    }
  }
}

export default new PaginationView();
