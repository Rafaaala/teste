"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NiranApp = NiranApp;
var react_1 = require("react");
var mobile_frame_1 = require("@/components/mobile-frame");
var bottom_nav_1 = require("@/components/bottom-nav");
var home_screen_1 = require("@/components/screens/home-screen");
var menu_screen_1 = require("@/components/screens/menu-screen");
var product_detail_1 = require("@/components/screens/product-detail");
var cart_screen_1 = require("@/components/screens/cart-screen");
var checkout_screen_1 = require("@/components/screens/checkout-screen");
var profile_screen_1 = require("@/components/screens/profile-screen");
var about_screen_1 = require("@/components/screens/about-screen");
var cart_context_1 = require("@/lib/cart-context");
function AppContent() {
    var _a = (0, react_1.useState)("home"), activeScreen = _a[0], setActiveScreen = _a[1];
    var _b = (0, react_1.useState)(null), selectedProduct = _b[0], setSelectedProduct = _b[1];
    var _c = (0, react_1.useState)(), menuCategory = _c[0], setMenuCategory = _c[1];
    var handleSelectProduct = function (product) {
        setSelectedProduct(product);
    };
    var handleBackFromProduct = function () {
        setSelectedProduct(null);
    };
    var handleNavigateToMenu = function (category) {
        setMenuCategory(category);
        setActiveScreen("menu");
    };
    var handleNavigateToCheckout = function () {
        setActiveScreen("checkout");
    };
    var renderScreen = function () {
        // Show product detail if a product is selected
        if (selectedProduct) {
            return (<product_detail_1.ProductDetail product={selectedProduct} onBack={handleBackFromProduct}/>);
        }
        switch (activeScreen) {
            case "home":
                return (<home_screen_1.HomeScreen onSelectProduct={handleSelectProduct} onNavigateToMenu={handleNavigateToMenu}/>);
            case "menu":
                return (<menu_screen_1.MenuScreen onSelectProduct={handleSelectProduct} initialCategory={menuCategory}/>);
            case "cart":
                return <cart_screen_1.CartScreen onCheckout={handleNavigateToCheckout}/>;
            case "checkout":
                return <checkout_screen_1.CheckoutScreen onBack={function () { return setActiveScreen("cart"); }}/>;
            case "profile":
                return <profile_screen_1.ProfileScreen />;
            case "about":
                return <about_screen_1.AboutScreen />;
            default:
                return (<home_screen_1.HomeScreen onSelectProduct={handleSelectProduct} onNavigateToMenu={handleNavigateToMenu}/>);
        }
    };
    return (<mobile_frame_1.MobileFrame>
      <div className="relative h-full">
        {renderScreen()}
        {!selectedProduct && activeScreen !== "checkout" && (<bottom_nav_1.BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen}/>)}
      </div>
    </mobile_frame_1.MobileFrame>);
}
function NiranApp() {
    return (<cart_context_1.CartProvider>
      <AppContent />
    </cart_context_1.CartProvider>);
}
