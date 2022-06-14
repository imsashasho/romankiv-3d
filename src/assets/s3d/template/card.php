<?php
// не должно быть пробелов перед первым тегом!!!
    echo json_encode('<div class="s3d-card js-s3d-card">
      <div class="s3d-card__top">
        <div class="s3d-card__image"><img src="" data-key="src"></div>
      </div>
      <div class="s3d-card__bottom">
          <div class="s3d-card__type">
            <span>Будинок</span>
            <span data-key="type"></span>
          </div>
          <table class="s3d-card__table">
             <tbody>
                <tr class="s3d-card__row">
                  <td class="s3d-card__name">№ квартиры</td>
                  <td class="s3d-card__line"></td>
                  <td class="s3d-card__value" data-key="number"></td>
                </tr>
                <tr class="s3d-card__row">
                  <td class="s3d-card__name">Этаж</td>
                  <td class="s3d-card__line"></td>
                  <td class="s3d-card__value" data-key="floor"></td>
                </tr>
                <tr class="s3d-card__row">
                  <td class="s3d-card__name">Кімнат:</td>
                  <td class="s3d-card__line"></td>
                  <td class="s3d-card__value" data-key="rooms"></td>
                </tr>
                <tr class="s3d-card__row">
                  <td class="s3d-card__name">Площа,м<sup>2</sup></td>
                  <td class="s3d-card__line"></td>
                  <td class="s3d-card__value" data-key="area"</td>
                </tr>
             </tbody>
          </table>
          <div class="s3d-card__cost">
            <span>100000 $</span>
          </div>
          <div class="s3d-card__buttons">
                <label type="button" data-id="" data-key="id" class="s3d-card__add-favourites js-s3d-add__favourites">
                  <input type="checkbox" data-key="checked" />  
                  <svg width="14" height="12" viewBox="0 0 34 32" fill="none" preserveAspectRatio="xMaxYMid slice" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linejoin="miter" stroke-linecap="butt" stroke-miterlimit="4" stroke-width="3.2" d="M16.658 27.371l0.409 0.362 0.409-0.362c0.695-0.615 1.538-1.382 2.471-2.232 0.688-0.627 1.427-1.299 2.192-1.989 4.247-3.828 5.606-5.145 7.067-7.12 1.559-2.108 2.686-3.631 2.782-5.895 0.115-1.972-0.573-3.911-1.927-5.428-1.149-1.259-2.716-2.123-4.452-2.453-1.688-0.284-3.429-0.060-4.971 0.642-1.394 0.603-2.617 1.504-3.57 2.63-0.953-1.126-2.176-2.027-3.57-2.63-1.542-0.701-3.283-0.926-4.971-0.642-1.736 0.33-3.303 1.193-4.452 2.453-1.354 1.517-2.042 3.457-1.927 5.428 0.096 2.264 1.222 3.787 2.782 5.895 1.461 1.976 2.819 3.293 7.067 7.12 0.766 0.69 1.504 1.362 2.192 1.989 0.934 0.85 1.777 1.617 2.471 2.232z"></path>
                    </svg>
                </label>
                <button type="button" class="s3d-card__link js-s3d-card__link">Детальніше
                  <svg width="60" height="50" viewBox="0 0 38 32" fill="none" preserveAspectRatio="xMaxYMid slice" xmlns="http://www.w3.org/2000/svg">
                    <path d="M37.76 16c0-8.491-6.787-15.36-15.141-15.36-4.532 0-8.603 2.022-11.38 5.227h-0.834c2.894-3.582 7.291-5.867 12.214-5.867 8.716 0 15.781 7.163 15.781 16s-7.065 16-15.781 16c-4.923 0-9.319-2.285-12.213-5.866h0.834c2.776 3.205 6.847 5.226 11.379 5.226 8.354 0 15.141-6.869 15.141-15.36z"></path>
                    <path d="M22.841 13.866l3.461 2.4-3.461 2.4v-1.979h-22.841v-0.842h22.841v-1.979z"></path>
                  </svg>
                </button>
          </div>
      </div>
   </div>')
?>
