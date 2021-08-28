<?php
// не должно быть пробелов перед первым тегом!!!
    echo json_encode('<div class="s3d-card js-s3d-card">
      <div class="s3d-card__top">
        <div class="s3d-card__type">
          <span data-key="type"></span>
        </div>
        <div class="s3d-card__close js-s3d-card__close"></div>
        <label data-id="" data-key="id" class="s3d-card__add-favourites js-s3d-add__favourites">
           <input type="checkbox" data-key="checked" />
           <svg><use xlink:href="#icon-favourites"></use></svg>
        </label>
        <div class="s3d-card__image"><img src="" data-key="src"></div>
      </div>
      <div class="s3d-card__bottom">
          <table class="s3d-card__table">
             <tbody>
                <tr class="s3d-card__row">
                  <td class="s3d-card__name">№ квартиры</td>
                  <td class="s3d-card__value" data-key="number"></td>
                </tr>
                <tr class="s3d-card__row">
                  <td class="s3d-card__name">Этаж</td>
                  <td class="s3d-card__value" data-key="floor"></td>
                </tr>
                <tr class="s3d-card__row">
                  <td class="s3d-card__name">Комнаты</td>
                  <td class="s3d-card__value" data-key="rooms"></td>
                </tr>
                <tr class="s3d-card__row">
                  <td class="s3d-card__name">Площадь м<sup>2</sup></td>
                  <td class="s3d-card__value" data-key="area"</td>
                </tr>
             </tbody>
          </table>
          <div class="s3d-card__buttons">
                <button type="button" class="s3d-card__link js-s3d-card__link">Детальніше
                  <svg width="164" height="13" viewBox="0 0 164 13" fill="none" preserveAspectRatio="xMaxYMid slice" xmlns="http://www.w3.org/2000/svg">
                     <path d="M0 6.5H163M163 6.5L157.3 1M163 6.5L157.3 12"></path>
                  </svg>
                </button>
          </div>
      </div>
   </div>')
?>
