import $ from 'jquery';
import _ from 'lodash';
import { updateFlatFavourite } from './general/General';
import paginationScroll from './pagination';
import sortArray from './sort';

class FlatsList {
  constructor(config) {
    this.subject = config.subject;
    this.hoverFlatId$ = config.hoverFlatId$;
    this.currentFilterFlatsId$ = config.currentFilterFlatsId$;
    this.updateCurrentFilterFlatsId = config.updateCurrentFilterFlatsId;
    this.getFlat = config.getFlat;
    this.checkNextFlyby = config.checkNextFlyby;
    this.changePopupFlyby = config.changePopupFlyby;
    this.currentShowAmount = 0;
    this.showFlatList = [];
    this.wrapperNode = document.querySelector('.js-s3d-filter__body');
    this.updateFsm = config.updateFsm;
    this.filterHide = false;
    // this.nameSort = undefined;
    this.directionSortUp = true;
    this.filter = config.filter;
    this.init();
  }

  init() {
    this.subject.subscribe(value => {
      updateFlatFavourite('.js-s3d-filter__table', value);
    });

    this.currentFilterFlatsId$.subscribe(value => {
      // if (_.isArray(value) && value.length > 0) {
      this.wrapperNode.scrollTop = 0;
      this.wrapperNode.textContent = '';
      this.currentShowAmount = 0;
      // }
      this.updateShowFlat(value);
      this.createListFlat(value, this.wrapperNode, 30);
    });

    this.hoverFlatId$.subscribe(id => {
      this.setActiveFlat(id);
    });

    this.wrapperNode.addEventListener('scroll', event => {
      if (event.target.scrollTop > 50 && !this.filterHide) {
        $('.js-s3d-filter').addClass('s3d-filter__scroll-active');
        setTimeout(() => (this.filterHide = true), 500);
      } else if (event.target.scrollTop < 50 && this.filterHide) {
        $('.js-s3d-filter').removeClass('s3d-filter__scroll-active');
        setTimeout(() => (this.filterHide = false), 500);
      }
      paginationScroll(
        event.target,
        this.showFlatList,
        this.currentShowAmount,
        this.createListFlat.bind(this),
      );
    });

    $('.js-s3d-filter__mini-info__button').on('click', event => {
      $('.js-s3d-filter').removeClass('s3d-filter__scroll-active');
      setTimeout(() => (this.filterHide = false), 500);
    });

    $('.js-s3d-filter__body').on('click', '.s3d-filter__tr', event => {
      const id = +event.currentTarget.dataset.id;
      if (
        $(event.originalEvent.target).hasClass('js-s3d-add__favourites') ||
        event.originalEvent.target.nodeName === 'INPUT'
      ) {
        return;
      }
      const config = this.checkNextFlyby({ type: 'flyby', method: 'search' }, id);
      if (config === null) {
        return;
      } else if (config.change) {
        this.changePopupFlyby(config, event.currentTarget);
        return;
      }

      if (window.innerWidth <= 992) {
        this.filter.emit('hideFilter');
      }
      this.updateFsm(config, id);
    });

    $('.js-s3d-filter__head').on('click', '.s3d-filter__th', e => {
      const nameSort =
        e.currentTarget && e.currentTarget.dataset && _.has(e.currentTarget.dataset, 'sort')
          ? e.currentTarget.dataset.sort
          : undefined;

      if (_.isUndefined(nameSort) || (nameSort && nameSort === 'none')) {
        return;
      }

      if (e.currentTarget.classList.contains('s3d-sort-active')) {
        this.directionSortUp = !this.directionSortUp;
      } else {
        this.directionSortUp = true;
      }
      $('.s3d-sort-active').removeClass('s3d-sort-active');
      if (this.directionSortUp) {
        $(e.currentTarget).addClass('s3d-sort-active');
      }

      this.updateCurrentFilterFlatsId(
        sortArray(this.showFlatList, nameSort, this.getFlat, this.directionSortUp),
      );
    });
  }

  setActiveFlat(id) {
    $('.js-s3d-filter__body .active-flat').removeClass('active-flat');
    $(`.js-s3d-filter__body [data-id=${id}]`).addClass('active-flat');
  }

  updateShowFlat(list) {
    this.showFlatList = list;
  }

  createListFlat(flats, wrap, amount) {
    // this.wrapperNode.innerHTML = '';
    const arr = flats.reduce((previous, current, index) => {
      if (index >= this.currentShowAmount && index < this.currentShowAmount + amount) {
        previous.push(this.createElem(this.getFlat(+current)));
      }
      return previous;
    }, []);
    this.currentShowAmount += amount;
    this.wrapperNode.append(...arr);

    this.setActiveFlat(this.hoverFlatId$.value);
  }

  createElem(flat) {
    const checked = flat.favourite ? 'checked' : '';
    const tr = document.createElement('div');
    // tr.dataset.id = flat.id;
    tr.classList = 's3d-filter__tr js-s3d-filter__tr';
    tr.innerHTML = `
					<div class="s3d-filter__td">${flat.floor}</div>
          <div class="s3d-filter__td">${flat.floor}</div>
					<div class="s3d-filter__td">${flat.area}</div>
					<div class="s3d-filter__td">
						<label data-id="${flat.id}" class="s3d-filter__table__label js-s3d-add__favourites">
							<input type="checkbox" ${checked}>
							<svg role="presentation"><use xlink:href="#icon-favourites"></use></svg>
						</label>
					</div>
			`;
    return tr;

    // const tr = document.createElement('tr')
    // tr.dataset.id = flat.id
    // tr.innerHTML = `
    // 			<td>${flat.type}</td>
    // 			<td>${flat.rooms}</td>
    // 			<td>${flat.floor}</td>
    // 			<td>${flat.all_room} m<sub>2</sub></td>
    // 			<td>
    // 				<label data-id="${flat.id}" class="s3d-filter__table__label js-s3d-add__favourites">
    // 					<input type="checkbox" ${checked}>
    // 					<svg role="presentation"><use xlink:href="#icon-favourites"></use></svg>
    // 				</label>
    // 			</td>
    // 	`
    // return tr
  }
}

export default FlatsList;
