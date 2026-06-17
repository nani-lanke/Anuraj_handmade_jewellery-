============================================================
  AnuRaj JEWELLERY  —  Website Guide
  Timeless Elegance. Crafted for You.
============================================================

Thank you! This is your complete handmade-craft website.
This short guide explains how to use it — no coding needed.


------------------------------------------------------------
  1.  HOW TO OPEN THE WEBSITE
------------------------------------------------------------
Double-click  index.html  to open it in your web browser.

That's it. The site works straight from your computer.


------------------------------------------------------------
  2.  HOW TO ADD / CHANGE PRODUCTS  (the important part)
------------------------------------------------------------
All products live inside the  "products"  folder. Inside it are
folders for each CATEGORY:

   products/
     bangles/
     hair-pins/
     handmade-jewellery/
     gift-boxes/
     memory-boxes/
     memory-books/
     photo-frames/
     handmade-gifts/
     other-craft/

To add a NEW PRODUCT:

   Step 1.  Go into the category folder you want
            (e.g. products/bangles).

   Step 2.  Create a NEW FOLDER and name it after the product
            (e.g. "golden-kundan-set"). Use dashes "-" instead
            of spaces.

   Step 3.  Put the product photos inside that folder.
            * Name the MAIN photo  main.jpg  (or main.png).
              This is the picture shown in the gallery.
            * Add as many extra photos as you like
              (2.jpg, 3.jpg, side.jpg ... any names).
              These appear on the product's detail page.

   Step 4.  (Optional) Add a text file named  info.txt  inside
            the folder to set the name, price and description:

                name: Golden Kundan Bangle Set
                price: Rs. 850
                description: Elegant kundan bangles with...

            If you skip info.txt, the folder name is used as the
            product name automatically.

   Step 5.  DOUBLE-CLICK  "Update-Gallery.bat"   <-- IMPORTANT
            (It refreshes the website with your new images.)

   Step 6.  Refresh the website in your browser. Done!

>>> Whenever you add, remove or rename images, just double-click
    Update-Gallery.bat again. Going from 12 to 13 images? Drop
    the new image in, double-click the .bat, refresh. The
    homepage and galleries update automatically.


------------------------------------------------------------
  3.  YOUR CONTACT DETAILS, WHATSAPP & SOCIAL LINKS
------------------------------------------------------------
Open  data/config.js  in Notepad and edit the values:

   * whatsapp     -> your WhatsApp number (country code + number,
                     digits only). Example for +91 98765 43210:
                         whatsapp: "919876543210",
   * phoneDisplay -> phone number to show on the page
   * email        -> your email address
   * location     -> your city / area
   * social       -> your Instagram / Facebook links
   * mapEmbed     -> (optional) a Google Maps embed link

Save the file and refresh the website. The WhatsApp buttons,
contact section and footer all update automatically.


------------------------------------------------------------
  4.  WHAT EACH FILE / FOLDER IS
------------------------------------------------------------
   index.html ............ Home page (open this one)
   category.html ......... Shows one category's products
   product.html .......... A single product's detail page
   Update-Gallery.bat .... DOUBLE-CLICK to refresh the gallery
   update-gallery.ps1 .... The script the .bat file runs
   README.txt ............ This guide

   products/ ............. YOUR product photos (edit these)
   data/config.js ........ YOUR contact & social settings (edit)
   data/products.js ...... Auto-made list of products (do NOT edit)
   assets/ ............... Brand banner image
   css/ , js/ ............ The website's design & behaviour


------------------------------------------------------------
  5.  CUSTOMER FEATURES ALREADY INCLUDED
------------------------------------------------------------
   * Category navigation + separate category pages
   * Modern responsive gallery (mobile / tablet / desktop)
   * Product detail pages with multiple photos + zoom
   * "Related items" suggestions
   * Customer reviews section (visitors can leave reviews)
   * Contact section with WhatsApp + social links
   * Floating WhatsApp button on every page
   * Share buttons (WhatsApp, Facebook, X, Pinterest, copy link)


------------------------------------------------------------
  6.  OWNER EDIT / QUICK PHOTO UPLOAD  (password protected)
------------------------------------------------------------
There is a hidden "Owner mode" that lets YOU log in and add
gallery photos straight from the browser — no .bat file needed
for a quick preview. Normal visitors never see any of this.

HOW TO OPEN THE OWNER LOGIN (any one of these):
   * Press   Ctrl + Shift + E   on your keyboard, OR
   * Type    index.html#edit    in the address bar, OR
   * Tap the "AR" logo in the FOOTER 5 times quickly (on phones)

FIRST TIME:
   You'll be asked to CREATE an owner username + password.
   - Only a scrambled (hashed) copy is saved inside YOUR browser.
   - The real password is NEVER written into any website file,
     so visitors and anyone reading the code cannot see it.
   - It is per-browser. To reset it, clear this site's data in
     your browser settings, then set it up again.

AFTER YOU LOG IN:
   A gold "Owner mode" bar appears at the bottom. You can:
   - "+ Add image to gallery" -> pick photos, give a title and
     category; it appears in the gallery right away.
   - Remove any photo YOU uploaded (the "Remove" button on it).
   - "Backup" -> Export your uploads to a file, or Import a file
     to copy them onto another device or browser (handy because
     uploads are otherwise saved on one device only).
   - Change your password, or Log out.

IMPORTANT — how far these uploads reach:
   Because the site has no server, photos added this way are
   saved in THIS browser and show on THIS device only (just like
   the customer reviews feature). It's perfect as a personal
   catalogue or quick preview.

   To publish a photo so EVERY visitor on every phone/PC sees it,
   use the folder method in section 2 (drop the image under
   products\... and run Update-Gallery.bat). That remains the way
   to make changes permanent and shared with everyone.

   (If later you want real online logins where uploads show for
   all visitors automatically, that needs a small free hosting
   service such as Netlify + Decap CMS or Firebase — ask and it
   can be set up.)


------------------------------------------------------------
  7.  PUTTING IT ONLINE (optional, later)
------------------------------------------------------------
The site is fully static, so it can be hosted FREE on services
like Netlify, GitHub Pages or Cloudflare Pages. Just upload this
whole folder. (Run Update-Gallery.bat once before uploading so
data/products.js is up to date.)


Crafted with care for AnuRaj Jewellery.  Enjoy! 💎
============================================================
