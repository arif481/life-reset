/**
 * @module HabitsEvents
 * @description Event handlers and initialization for habits module
 * @version 2.0.0
 */

window.HabitsEvents = (function() {
    'use strict';

    /**
     * Initialize habits view
     */
    function init() {
        HabitsUI.renderHabitsView();
    }

    return { init };
})();
