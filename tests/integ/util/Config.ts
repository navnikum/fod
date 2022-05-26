/**
 * Test constants used for integration tests.
 */
import { PicEnv } from '@spectra/automation-utils/auto-lib/BasePage';
export class Config {
    public static readonly THRESHOLD: number = 0.05;
    public static readonly TIMEOUT: number = 30000;
    public static readonly WAITTIME: number = 6000;
    public static readonly ASKORACLE_ID: string = 'ojspAskOracle';
    public static readonly ASKORACLE_PROFILE_ID: string = 'ojspAskOracleUserProfile';
    public static readonly BASELINE_PATH: string = '/tests/integ/specs';
    public static readonly VERIFY_PATH: string = '/reports/integ-tests/selenium/specs';
    public static readonly ORDER_SEARCH_FILTER_ID: string = 'oj_ssfs1';
    public static readonly ORDER_SEARCH_BUTTON_CSS: string = '.oj-sp-smart-filters-expand-search-button';
    public static readonly ORDER_TABLE_MENU_BUTTON_ID: string = 'orders-table-menu-btn-';
    public static readonly ORDER_ACTION_MENU_ID: string = 'orders-table-menu-';
    public static readonly MESSAGE_ID: string = 'ojspMessages';
    public static readonly READONLY_HEADER_ID: string = 'spectra-header-general-overview-1';
    public static readonly READONLY_SMART_FILTER_ID: string = 'oj_ssfs1';
    public static readonly SHELL_ID: string = 'ojSpSimpleUIShell';
    public static readonly USERPROFILE_ID: string = 'ojSpSimpleUIShellUserProfile_GUMa1';
    public static readonly SIGNOUT_ID: string = 'ojSpSimpleUIShellUserProfile_GUMSignOut';
    public static readonly LIST_ID: string = 'order-list';
    public static readonly LIST_CUSTOMER_ID: string = 'customer-order-list';
    public static readonly LISTITEM_ID_PREFIX: string = 'order-list-template-';
    public static readonly CUSTOMER_ORDER_ID_PREFIX: string = 'customer-order-list-template-';
    public static readonly LISTITEM_TAG_NAME: string = 'oj-sp-list-item-template';
    public static readonly DELETE_CONF_DIALOG_ID: string = 'order-delete-conf-dialog';
    public static readonly DELETE_BUTTON_ID: string = 'order-delete';
    public static readonly SCECCA_ID: string = 'order-simple-create-edit';
    public static readonly ORDER_CUSTOMER_FRAGMENT_ID: (input: boolean ) => string = (input: boolean): string => `oj-vb-fragment-${input ? 'input' : 'display' }-customer`;
    public static readonly ORDER_CUSTOMER_ID: (input: boolean ) => string = (input: boolean): string => `${Config.ORDER_CUSTOMER_FRAGMENT_ID(input)}-name`;
    public static readonly ORDER_PHONE_ID: (input: boolean ) => string = (input: boolean): string => `${Config.ORDER_CUSTOMER_FRAGMENT_ID(input)}-phone`;
    public static readonly ORDER_CUSTOMER_EMAIL: (input: boolean ) => string = (input: boolean): string => `${Config.ORDER_CUSTOMER_FRAGMENT_ID(input)}-email`;
    public static readonly ORDER_TABLE_ID: string = 'edit-order-lines-table';
    public static readonly SELECT_PRODUCT_ID: string = 'order-line-product-';
    public static readonly ORDER_QTY_ID: string = 'order-line-qty-';
    public static readonly ORDER_LINE_SAVE_ID: string = 'order-line-save-';
    public static readonly ORDER_COMMENTS_ID: string = 'order-comments';
    public static readonly SUBMIT_DIALOG_ID: string = 'oj-dialog-submit-confirmation';
    public static readonly SHIPPING_ADDRESS: string = 'shipping-address';
    public static readonly SHIPPING_ADDRESS_LINE1_ID: string = 'shipping-address-line1';
    public static readonly SHIPPING_ADDRESS_LINE2_ID: string = 'shipping-address-line2';
    public static readonly SHIPPING_ADDRESS_CITY_ID: string = 'shipping-address-city';
    public static readonly SHIPPING_ADDRESS_ZIP_ID: string ='shipping-address-zip';
    public static readonly SHIPPING_ADDRESS_STATE_ID: string ='shipping-address-state';
    public static readonly SHIPPING_ADDRESS_COUNTRY_ID: string ='shipping-address-country';
    public static readonly ADD_LINE_BUTTON_ID: string = 'create-line-item';
    public static readonly ATTACHMENTS_ID: string = 'oj-sp-attachments-simple';
    public static readonly CUSTOMER_OVERVIEWPAGE_ID: string = 'customer-overview-page';
    public static readonly CUSTOMER_OVERVIEW_ID: string = 'customer-overview';
    public static readonly CUSTOMER_USERNAME: string = 'arul.wilson@oracle.com';
    public static readonly CUSTOMER_PWD: string = 'Hos49JTL';
    public static readonly ADMIN_USERNAME: string = 'helpadmin';
    public static readonly ADMIN_PWD: string = 'Welcome1';
    public static readonly CONFIRM_ID: string = 'Confirm';
    public static readonly WELCOME_ID: string = 'welcome-page-template';
    public static readonly WELCOME_LIST_ID: string = 'draft-orders-list';
    public static readonly OBJECT_CARD_TAG: string = 'oj-sp-object-card';
    public static readonly INVENTORY_SEARCH_FILTER_ID: string = 'inventory-search-filter';
    public static readonly INVENTORY_LIST_ID: string = 'inventory-product-list';
    public static readonly INVENTORY_CARD_ID_PREFIX: string = 'product-card-';
    public static readonly INVENTORY_CARD_SEARCH_STRING: string = 'Slimline';
    public static readonly APP_NAVIGATION_ID: string = 'in-app-navigation';
    public static readonly DIRTY_DATA_MESSAGE_DIALOG_ID: string = 'dirtyDataWarningDialog';
    public static readonly MANAGE_ORDERS_PAGE_TITLE: string = 'Orders';
    public static readonly EDIT_ORDER_PAGE_TITLE: string = 'Edit Order';
    public static readonly INVENTORY_PAGE_TITLE: string = 'Inventory';
    public static readonly PRODUCT_DETAIL_PAGE_TILE: string = 'Product Detail';
    public static readonly WELCOME_PAGE_TITLE: string = 'Home';
    public static readonly TRAINING_PAGE_TITLE: string ='Training and Development';
    public static readonly ANALYTIC_PAGE_TITLE: string ='Oracle Fusion Cloud Applications';
    public static readonly TRAINING_LIST_ID: string ='journey-list';
    public static readonly TRAINING_CARD_ID_PREFIX: string = 'oj-sp-image-card-';
    public static readonly PRA_DONE_BUTTON_ID: (index: number) => string = (index: number) => `task_${index}_detail_done`;
    public static readonly CARD_STATUS: (index: number) => string = (index: number) => `oj-sp-image-card-${index}_badge`;
    public static readonly EMO_BTN_ID_SUFFIX : string = '_emo_btn_';
    public static readonly _APP_NAVIGATION_TAB_BAR: string = Config.APP_NAVIGATION_ID + '_IANTabBar';
    public static readonly _DIRTY_DATA_DIALOG_ID = '_messageDirtyDataDialog';
    public static readonly _DIRTY_DATA_DIALOG_DELETE_ID = '_deleteConfirm';
    public static readonly _DIRTY_DATA_MESSAGE_DIALOG_DISCARD_ID: string = '_discardChanges';
    public static readonly _SUBMIT_CONFIRMATION_DIALOG_ID = '_dialog';
    public static readonly _SUBMIT_CONFIRMATION_DIALOG_SUBMIT_ID = '_primaryButton';
    public static readonly CONVEYOR_AMOUNT : string = 'order-simple-create-edit_h_contextualInfo2';
    public static readonly APP_NAVIGATION_MANAGE_ORDERS_KEY: string = 'manage-orders';
    public static readonly APP_NAVIGATION_INVENTORY_KEY: string = 'inventory';
    public static readonly APP_NAVIGATION_TRAINING_KEY: string ='my-training';
    public static readonly APP_NAVIGATION_ANALYTICS_KEY: string ='dashboard';
    public static readonly _FEEDBACK_DIALOG_ID = 'order-simple-create-edit_h_primaryAction_emo_feedbackDialog';
    public static readonly _FEEDBACK_YES_ID = 'order-simple-create-edit_h_primaryAction_emo_btn_feedback_submit';
    public static readonly ORDER_TITLE = 'oj_ssfs1_h';
    public static readonly SUPPLIER_INPUT_ID = 'oj-selectsingle-1';
    public static readonly PRODUCT_INPUT_ID = 'oj-selectsingle-2';
    public static readonly CATEGORY_INPUT_ID = 'oj-selectsingle-3';
    public static readonly ADD_PRODUCT_ACTIVATION = 'add-product-guided-process_primaryAction';
    public static readonly CANCEL_BTN_PRODUCT_ACTIVATION = 'add-product-guided-process_cancelOnExpand';
    
    
    
  


    public static readonly GDPCCA_ID:string ='add-product-guided-process';
    public static readonly ADD_PRODUCT_PAGE_TITLE: string = 'Add Product to Inventory';
    public static readonly ADD_PRODUCT_BTN: string = 'inventory-search-filter_h_primaryAction';
    public static readonly SUPPLIERS = new Map([['Computing Innovations', 1], ['Technology Innovations', 2], ['Electronics Innovations', 3],
     ['Gadget Innovations', 4]]);
     public static readonly CATEGORY = new Map([['Wearables', 1], ['Smart Watches', 2], ['Audio', 3],
     ['Tablets', 4],['Laptops', 5],['Computer Accessories', 4]]);


    public static readonly CUSTOMERS = new Map([['Tammy Bryant', 1], ['Roy White', 2], ['Gary Jenkins', 3],
     ['Victor Morris', 4]]);
     public static readonly SUPPLIERS_NAME = new Map([['Computing Innovations', '1'], ['Technology Innovations', '2'], ['Electronics Innovations', '3'],
     ['Gadget Innovations', '4']]);

    public static readonly PRODUCT_NAME = new Map([['Quantum Laptop Q1', 1]]);
    public static INVENTORY_PRODUCT_DETAIL_FOLDER_LAYOUT: string = 'foldout_layout_Horizontal_page';
    public static INVENTORY_PRODUCT_DETAIL_OVERVIEW_1: string = 'oj-sp-item-overview-1';
    public static SUMMARY_COLLECTION: string = 'product_detail';
    public static SUPPLIER_CONATCT_PANEL: string = 'supplier-contact-panel';
    public static SUPPLIER_PRODUCT_PANEL: string = 'supplier-product-panel';
    public static SUPPLIER_ORDER_PANEL: string = 'order-list-panel';

    public static getPicEnv(funcName: string): PicEnv {
        const originPath: string = `${Config.BASELINE_PATH}/${funcName}/screen/`;
        const targetPath: string = `${Config.VERIFY_PATH}/${funcName}/snapshotpic/`;
        return { original: originPath, save: 'target', target: targetPath };
    }
}
