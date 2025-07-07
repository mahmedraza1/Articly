'use client';
import { useState, useRef, useEffect } from "react";
import { html } from 'js-beautify';
import { resizeAndCompressImage } from "../utils/compressImage";
import toast from "react-hot-toast";

export default function Home() {
  const [clientName, setClientName] = useState("");
  const [processedImages, setProcessedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [processedContent, setProcessedContent] = useState("");
  const contentEditableRef = useRef(null);
  const outputEditableRef = useRef(null);
  const [selected, setSelected] = useState("Add Disclaimer");
  const [discText, setDiscText] = useState("");
  const [originalHTML, setOriginalHTML] = useState("");

  useEffect(() => {
    const savedClient = localStorage.getItem('lastClient');
    if (savedClient) setClientName(savedClient);
  }, []);

  useEffect(() => {
    const text = localStorage.getItem('discText');
    if (text) {
      setDiscText(text);
    }
  }, []);

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    
    // Capture original HTML from clipboard
    const htmlData = e.clipboardData.getData('text/html');
    if (htmlData) {
      setOriginalHTML(htmlData);
      // console.log("Original Article HTML:", htmlData);
    }
    
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const blob = item.getAsFile();
        const reader = new FileReader();

        reader.onload = () => {
          const range = document.getSelection().getRangeAt(0);
          const img = document.createElement('img');
          img.src = reader.result;
          range.insertNode(img);
          
          // Update original HTML after image insertion
          setTimeout(() => {
            const updatedHTML = contentEditableRef.current.innerHTML;
            setOriginalHTML(updatedHTML);
            // console.log("Original Article HTML (with images):", updatedHTML);
          }, 100);
        };
        reader.readAsDataURL(blob);
      }
    }
  };

  const handleReload = () => {
    location.reload();
  };

 function formatName(name) {
    const nameParts = name.trim().split(/\s+/);
    
    // Capitalize each part of the name
    const formattedParts = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
    
    // Handle different lengths of names (up to four parts)
    if (formattedParts.length === 1) {
      return formattedParts[0];
    } else if (formattedParts.length === 2) {
      return `${formattedParts[0]} ${formattedParts[1]}`;
    } else if (formattedParts.length === 3) {
      return `${formattedParts[0]} ${formattedParts[1]} ${formattedParts[2]}`;
    } else if (formattedParts.length === 4) {
      return `${formattedParts[0]} ${formattedParts[1]} ${formattedParts[2]} ${formattedParts[3]}`;
    }
    
    return formattedParts.join(' ');
  }
  
  const processContent = async () => {
    const cleanClientName = formatName(clientName.trim());
    if (!cleanClientName) {
      toast.error("Please Enter Client Name First")
      return;
    }

    setIsProcessing(true);
    try {
      const rawHTML = contentEditableRef.current.innerHTML;
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = rawHTML;






      // Process links and clean formatting
      tempDiv.querySelectorAll("a").forEach((a) => {
        const href = a.href;
        const isEmbedded = [
          "mark.local"
        ].some(domain => href.includes(domain));

        if (!isEmbedded) {
          a.rel = "nofollow";
          a.target = "_blank";
        }
        a.removeAttribute("style");
        a.removeAttribute("class");
      });

      // Remove empty image containers
      tempDiv.querySelectorAll("img").forEach((img) => {
        const container = img.parentElement;
        img.remove();
        if (container && !container.textContent.trim() && container.children.length === 0) {
          container.remove();
        }
      });

      // Processed HTML
      let processedHTML = tempDiv.innerHTML;

      // If "Sponsored" checkbox is checked, add the disclaimer
      if (selected === "Add Disclaimer") {
        processedHTML += ` 
          <hr />
          <p style="text-align: center;"><em>${discText}</em></p>
        `;
      }

      setProcessedContent(processedHTML);

      // Process images with fixed 825px width
      const images = contentEditableRef.current.querySelectorAll("img");
      const date = new Date();
      const month = date.toLocaleString("default", { month: "short" });
      const day = date.getDate();

      const storageKey = `client-${cleanClientName}`;
      let lastIndex = parseInt(localStorage.getItem(storageKey)) || 0;

      const imageProcessing = Array.from(images).map(async (img, index) => {
        try {
          let blob;
          if (img.src.startsWith("data:")) {
            const byteString = atob(img.src.split(",")[1]);
            const mimeType = img.src.split(":")[1].split(";")[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
            blob = new Blob([ab], { type: mimeType });
          } else {
            const response = await fetch(img.src);
            blob = await response.blob();
          }

          const imageNumber = lastIndex + index + 1;
          const processedImage = await resizeAndCompressImage(
            blob,
            `${cleanClientName} ${month} ${day}-${imageNumber}`
          );

          // Check if image is wrapped in an anchor tag by looking at the original HTML
          let imageLink = null;
          if (originalHTML) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = originalHTML;
            const anchors = tempDiv.querySelectorAll('a');
            
            anchors.forEach(anchor => {
              const imgInAnchor = anchor.querySelector('img');
              if (imgInAnchor && imgInAnchor.src === img.src) {
                imageLink = anchor.href;
              }
            });
          }

          return {
            ...processedImage,
            originalLink: imageLink
          };
        } catch (error) {
          console.error(`Image ${index + 1} failed:`, error);
          return null;
        }
      });

      const processedImages = (await Promise.all(imageProcessing)).filter(Boolean);
      setProcessedImages(processedImages);

      localStorage.setItem("lastClient", cleanClientName);
      localStorage.setItem(storageKey, lastIndex + images.length);
      toast.success("Content Processed")
    } catch (error) {
      console.error("Processing failed:", error);
      toast.error("Error processing content. Please check the console.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = async (image) => {
    try {
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: `${image.name}.${image.format}`,
          types: [{
            description: 'Image Files',
            accept: { [`image/${image.format}`]: [`.${image.format}`] }
          }]
        }
      );
        const writable = await handle.createWritable();
        await writable.write(await fetch(image.url).then(r => r.blob()));
        await writable.close();
      } else {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `${image.name}.${image.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast.success("Image Downloaded")
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Download failed:", error);
        toast.error(`Download failed: ${error.message}`);
      }
    }
  };

  const copyLink = async (link) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(link);
        toast.success("Link Copied to Clipboard");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = 'absolute';
        textArea.style.opacity = 0;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Link Copied to Clipboard");
      }
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy link");
    }
  };




  // Handle "Copy HTML" action
  const handleCopyHTML = () => {
    try {
      let htmlContent = processedContent;
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');


      // Remove empty <span> elements
      // const emptySpans = doc.querySelectorAll('span');
      // emptySpans.forEach((span) => {
      //   if (!span.innerHTML.trim()) {
      //     span.remove();
      //   }
      // });


      // Unwrap all span elements (remove span but keep contents)
      doc.querySelectorAll('span').forEach((span) => {
        const parent = span.parentNode;
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
      });

      // Remove empty anchor tags
      doc.querySelectorAll('a').forEach((a) => {
        if (!a.innerHTML.trim()) {
          a.remove();
        }
      });




      const emptyanchors = doc.querySelectorAll('a');
      emptyanchors.forEach((a) => {
        if (!a.innerHTML.trim()) {
          a.remove();
        }
      });
      // Remove empty <span> elements
      const emptyH1 = doc.querySelectorAll('h1');
      emptyH1.forEach((h1) => {
        if (!h1.innerHTML.trim()) {
          h1.remove();
        }
      });
      const emptyH2 = doc.querySelectorAll('h2');
      emptyH2.forEach((h2) => {
        if (!h2.innerHTML.trim()) {
          h2.remove();
        }
      });
      const emptyH3 = doc.querySelectorAll('h3');
      emptyH3.forEach((h3) => {
        if (!h3.innerHTML.trim()) {
          h3.remove();
        }
      });
      const emptyH4 = doc.querySelectorAll('h4');
      emptyH4.forEach((h4) => {
        if (!h4.innerHTML.trim()) {
          h4.remove();
        }
      });
      const emptyH5 = doc.querySelectorAll('h5');
      emptyH5.forEach((h5) => {
        if (!h5.innerHTML.trim()) {
          h5.remove();
        }
      });
      const emptyH6 = doc.querySelectorAll('h6');
      emptyH6.forEach((h6) => {
        if (!h6.innerHTML.trim()) {
          h6.remove();
        }
      });



      const emptyP = doc.querySelectorAll('p');
      emptyP.forEach((p) => {
        if (!p.innerHTML.trim()) {
          p.remove();
        }
      });
      // console.log(doc)

      // Remove all instances of non-breaking spaces (&nbsp;)
      const allElements = doc.querySelectorAll('*');
      allElements.forEach((element) => {
        // Check and replace all instances of &nbsp; with an empty string
        element.innerHTML = element.innerHTML.replace(/\u00A0/g, '').replace(/&nbsp;/g, '');
      });


      // remove br tags
      const lineBreaks = doc.querySelectorAll('br');
      lineBreaks.forEach((br) => {
        br.remove();
      });


      // Function to process each element and wrap text nodes
      const processElement = (element) => {
        const style = element.getAttribute('style') || '';

        // Parse font-weight
        let fontWeight = null;
        const fontWeightMatch = style.match(/font-weight\s*:\s*(bold|\d+)/i);
        if (fontWeightMatch) {
          const value = fontWeightMatch[1].toLowerCase();
          fontWeight = value === 'bold' ? 700 : parseInt(value, 10);
        }

        // Parse font-style
        let fontStyle = null;
        const fontStyleMatch = style.match(/font-style\s*:\s*(italic)/i);
        if (fontStyleMatch) {
          fontStyle = fontStyleMatch[1].toLowerCase();
        }

        // Wrap in <strong> if font-weight > 400
        if (fontWeight && fontWeight >= 700) {
          const strong = document.createElement('strong');
          strong.innerHTML = element.innerHTML;
          element.innerHTML = '';
          element.appendChild(strong);
        }

        // Wrap in <em> if font-style is italic
        if (fontStyle === 'italic') {
          const em = document.createElement('em');
          em.innerHTML = element.innerHTML;
          element.innerHTML = '';
          element.appendChild(em);
        }
        // Recursively process child elements
        Array.from(element.children).forEach(processElement);
      };

      // Process the root element (body)
      processElement(doc.body);

      // Step 2: Remove 'dir="ltr"' and filter styles
      const elementsWithDir = doc.querySelectorAll('[dir="ltr"]');
      elementsWithDir.forEach((element) => {
        element.removeAttribute('dir');
      });

      const elementsWithStyle = doc.querySelectorAll('[style]');
      elementsWithStyle.forEach((element) => {
        const currentStyle = element.getAttribute('style');

        // Filter to preserve only "text-align: center"
        const updatedStyle = currentStyle
          .split(';')
          .filter(style => style.includes('text-align: center'))
          .join(';');

        if (updatedStyle) {
          element.setAttribute('style', updatedStyle);
        } else {
          element.removeAttribute('style');
        }
      });

      // Beautify HTML
      htmlContent = doc.body.innerHTML;

      const beautifiedHTML = html(htmlContent, {
        indent_size: 2,
        preserve_newlines: true,
        max_preserve_newlines: 1,
      });

      // Copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(beautifiedHTML).then(() => {
          setIsCopying(true);
          setTimeout(() => {
            setIsCopying(false); // Reset button text after 2 seconds
            toast.success("HTML Copied to Clipboard")
          }, 150);
        }).catch((error) => {
          console.error('Failed to copy:', error);
          toast.error('Failed to copy formatted HTML content.');
        });
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = beautifiedHTML;
        textArea.style.position = 'absolute';
        textArea.style.opacity = 0;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setIsCopying(true);
        setTimeout(() => {
          setIsCopying(false);
          toast.success('HTML Copied to Clipboard');
        }, 150);
      }
    } catch (error) {
      console.error('Error copying formatted HTML:', error);
      toast.error('An error occurred while copying formatted HTML content.');
    }
  };





  return (
    <main className="min-h-screen  bg-[#e9e9e9] text-white flex flex-col items-center p-6">
      

      <div className="getClient flex items-center justify-start self-start mb-1 gap-x-5">
        <input
          type="text"
          placeholder="Enter Client Name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="p-2 w-96 border border-gray-400 rounded-full px-3 text-black"
          required
        />
        <div>
          <label className={`flex items-center ${selected === "Add Disclaimer" ? "bg-blue-600" : "bg-red-600"} px-2 w-44 py-4 select-none rounded-full cursor-pointer text-white font-bold`}>
            <input
              type="checkbox"
              checked={selected === "Add Disclaimer"}
              onChange={() => setSelected(selected === "No Disclaimer" ? "Add Disclaimer" : "No Disclaimer")}
              className="mr-2 accent-white"
            />
            {selected}
          </label>
        </div>
        <button
          onClick={processContent}
          disabled={isProcessing}
          className="px-3 cursor-pointer bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed py-4 rounded-full"
        >
          {isProcessing ? 'Processing...' : 'Process Content'}
        </button>
        {/* Add Copy HTML Button */}
        <button
          onClick={handleCopyHTML}
          disabled={isCopying || !processedContent}
          className="px-3 py-4 bg-blue-600 cursor-pointer font-bold disabled:bg-gray-500 disabled:cursor-not-allowed text-white hover:bg-blue-700 rounded-full"
        >
          {isCopying ? 'Copied' : 'Copy HTML'}
        </button>
          <div onClick={handleReload} className="w-12 h-12 font-extrabold text-4xl flex items-center justify-center rounded-full cursor-pointer bg-orange-500 hover:bg-orange-400 bg-center bg-no-repeat">&uarr;</div>
      </div>
      <div className="imagesHandle w-full my-7">
        {processedImages.length > 0 && (
          <div className="w-full">
            <div className="grid grid-cols-6 gap-4">
              {processedImages.map((image, index) => (
                <div key={index} className="text-center bg-[#d3d3d3] p-2 rounded-lg relative">
                  {/* Link indicator */}
                  {image.originalLink && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      🔗
                    </div>
                  )}
                  <img
                    src={image.url}
                    alt="Processed"
                    className="w-full h-48 object-contain mb-2 rounded"
                  />
                  <p className="text-sm text-black font-semibold mb-2">{image.name}.{image.format}</p>
                  <p className="text-xs text-gray-600 mb-2">
                    {Math.round(image.size / 1024)}KB - {image.dimensions.width}x{image.dimensions.height}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => downloadImage(image)}
                      className="px-3 py-2 bg-blue-600 cursor-pointer text-white rounded font-bold hover:bg-blue-700 text-sm"
                    >
                      Download
                    </button>
                    {image.originalLink && (
                      <button
                        onClick={() => copyLink(image.originalLink)}
                        className="px-3 py-2 bg-green-600 cursor-pointer text-white rounded font-bold hover:bg-green-700 text-sm"
                        title="Copy original link"
                      >
                        Copy Link
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      <div className="textHandle  w-full h-[69vh] flex items-center justify-center gap-x-5">
        <div
          ref={contentEditableRef}
          className="w-1/2 h-[67vh] border-2 border-dashed border-white rounded-lg p-6 mb-6 
                 bg-white text-black overflow-auto"
          contentEditable
          placeholder="Paste your content here (text + images)..."
          onPaste={handlePaste}
        ></div>

        <div className="prose w-1/2 h-[67vh] border-2 border-dashed border-white rounded-lg p-6 mb-6 
                 bg-white text-black overflow-auto">
          <div
            ref={outputEditableRef}
            contentEditable
            dangerouslySetInnerHTML={{ __html: processedContent }}
            className="outline-none"
          />
        </div>
      </div>
          {/* Mark */}

    </main>
  );
}
