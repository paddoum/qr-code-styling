
import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

function App() {
  const [qrCode, setQrCode] = useState(null);
  const [data, setData] = useState('https://replit.com');
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300);
  const [margin, setMargin] = useState(10);
  const [dotsType, setDotsType] = useState('dots');
  const [dotsColor, setDotsColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageMargin, setImageMargin] = useState(5);
  const [imageSize, setImageSize] = useState(0.4);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('Q');
  const [useDotsGradient, setUseDotsGradient] = useState(false);
  const [dotsGradientType, setDotsGradientType] = useState('linear');
  const [dotsGradientColor1, setDotsGradientColor1] = useState('#000000');
  const [dotsGradientColor2, setDotsGradientColor2] = useState('#4267B2');
  const [dotsGradientRotation, setDotsGradientRotation] = useState(0);
  const [useBackgroundGradient, setUseBackgroundGradient] = useState(false);
  const [backgroundGradientType, setBackgroundGradientType] = useState('linear');
  const [backgroundGradientColor1, setBackgroundGradientColor1] = useState('#ffffff');
  const [backgroundGradientColor2, setBackgroundGradientColor2] = useState('#e9ebee');
  const [backgroundGradientRotation, setBackgroundGradientRotation] = useState(0);
  const [useProxy, setUseProxy] = useState(false);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Initialize QR code on component mount
    updateQrCode();
    
    // Clean up if needed
    return () => {};
  }, [
    data, width, height, margin, dotsType, dotsColor, backgroundColor,
    useDotsGradient, dotsGradientType, dotsGradientColor1, dotsGradientColor2, dotsGradientRotation,
    useBackgroundGradient, backgroundGradientType, backgroundGradientColor1, backgroundGradientColor2, backgroundGradientRotation,
    errorCorrectionLevel
  ]); // Update whenever any parameter changes

  useEffect(() => {
    if (qrCode && canvasRef.current) {
      canvasRef.current.innerHTML = '';
      qrCode.append(canvasRef.current);
    }
  }, [qrCode]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUrl('');
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        updateQrCode(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const urlToDataURI = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const dataURI = canvas.toDataURL('image/png');
        resolve(dataURI);
      };

      img.onerror = function() {
        reject(new Error('Failed to load image'));
      };

      // Use CORS proxy if checkbox is checked
      img.src = useProxy ? `https://cors-anywhere.herokuapp.com/${url}` : url;
      console.log("Using image URL:", img.src);
    });
  };

  const updateQrCode = async (imageData = null) => {
    if (!canvasRef.current) return;
    
    // Show loading indicator
    canvasRef.current.innerHTML = "<div class='text-center p-5'>Generating QR code...</div>";

    const options = {
      width,
      height,
      type: "svg",
      data,
      margin,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel
      },
      cornersSquareOptions: {
        type: "square",
        color: "#000000"
      },
      cornersDotOptions: {
        type: "square",
        color: "#000000"
      }
    };

    // Handle dots options with gradient support
    if (useDotsGradient) {
      options.dotsOptions = {
        type: dotsType,
        gradient: {
          type: dotsGradientType,
          rotation: dotsGradientRotation,
          colorStops: [
            { offset: 0, color: dotsGradientColor1 },
            { offset: 1, color: dotsGradientColor2 }
          ]
        }
      };
    } else {
      options.dotsOptions = {
        type: dotsType,
        color: dotsColor
      };
    }

    // Handle background options with gradient support
    if (useBackgroundGradient) {
      options.backgroundOptions = {
        gradient: {
          type: backgroundGradientType,
          rotation: backgroundGradientRotation,
          colorStops: [
            { offset: 0, color: backgroundGradientColor1 },
            { offset: 1, color: backgroundGradientColor2 }
          ]
        }
      };
    } else {
      options.backgroundOptions = {
        color: backgroundColor
      };
    }

    try {
      // Handle image if provided
      if (imageData) {
        options.image = imageData;
        options.imageOptions = {
          margin: imageMargin,
          imageSize: imageSize,
          hideBackgroundDots: true
        };
      } else if (imageUrl && imageUrl.trim() !== '') {
        try {
          const dataURI = await urlToDataURI(imageUrl);
          options.image = dataURI;
          options.imageOptions = {
            margin: imageMargin,
            imageSize: imageSize,
            hideBackgroundDots: true
          };
        } catch (error) {
          console.error("Error converting image:", error);
          canvasRef.current.innerHTML = "<div class='text-red-500 text-center p-5'>Failed to load image. Check URL and try again.</div>";
          return;
        }
      }

      // Create new QR code with updated options
      const newQrCode = new QRCodeStyling(options);
      
      // Clear previous and append new
      canvasRef.current.innerHTML = "";
      newQrCode.append(canvasRef.current);
      
      // Store for download
      setQrCode(newQrCode);
    } catch (error) {
      console.error("Error generating QR code:", error);
      canvasRef.current.innerHTML = "<div class='text-red-500 text-center p-5'>Error generating QR code. Please check your settings.</div>";
    }
  };

  const downloadQrCode = () => {
    if (qrCode) {
      qrCode.download({
        extension: "svg",
        name: "qr-code"
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto p-4 gap-6">
      <div className="flex-1 overflow-y-auto max-h-screen">
        <h1 className="text-2xl font-bold mb-4">QR Code Configuration</h1>

        {/* Basic Options */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 pb-2 border-b">Basic Options</h3>
          
          <div className="mb-4">
            <label htmlFor="data" className="block font-medium mb-1">QR Code Content:</label>
            <textarea 
              id="data" 
              value={data} 
              onChange={(e) => setData(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              rows="3"
            ></textarea>
          </div>

          <div className="mb-4">
            <label htmlFor="width" className="block font-medium mb-1">Width:</label>
            <input 
              type="number" 
              id="width" 
              value={width} 
              onChange={(e) => setWidth(parseInt(e.target.value))}
              min="100" 
              max="1000"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="height" className="block font-medium mb-1">Height:</label>
            <input 
              type="number" 
              id="height" 
              value={height} 
              onChange={(e) => setHeight(parseInt(e.target.value))}
              min="100" 
              max="1000"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="margin" className="block font-medium mb-1">Margin:</label>
            <input 
              type="number" 
              id="margin" 
              value={margin} 
              onChange={(e) => setMargin(parseInt(e.target.value))}
              min="0" 
              max="100"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Dots Options */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 pb-2 border-b">Dots Options</h3>
          
          <div className="mb-4">
            <label htmlFor="dotsType" className="block font-medium mb-1">Dots Type:</label>
            <select 
              id="dotsType" 
              value={dotsType} 
              onChange={(e) => setDotsType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="square">Square</option>
              <option value="dots">Dots</option>
              <option value="rounded">Rounded</option>
              <option value="classy">Classy</option>
              <option value="classy-rounded">Classy Rounded</option>
              <option value="extra-rounded">Extra Rounded</option>
            </select>
          </div>

          <div className="mb-4 flex items-center">
            <input 
              type="checkbox" 
              id="useDotsGradient" 
              checked={useDotsGradient} 
              onChange={(e) => setUseDotsGradient(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="useDotsGradient" className="font-medium">Use Gradient</label>
          </div>

          {!useDotsGradient ? (
            <div className="mb-4">
              <label htmlFor="dotsColor" className="block font-medium mb-1">Color:</label>
              <input 
                type="color" 
                id="dotsColor" 
                value={dotsColor} 
                onChange={(e) => setDotsColor(e.target.value)}
                className="w-full h-10 p-1 border border-gray-300 rounded"
              />
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <label htmlFor="dotsGradientType" className="block font-medium mb-1">Gradient Type:</label>
                <select 
                  id="dotsGradientType" 
                  value={dotsGradientType} 
                  onChange={(e) => setDotsGradientType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="linear">Linear</option>
                  <option value="radial">Radial</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="dotsGradientColor1" className="block font-medium mb-1">Color 1:</label>
                <input 
                  type="color" 
                  id="dotsGradientColor1" 
                  value={dotsGradientColor1} 
                  onChange={(e) => setDotsGradientColor1(e.target.value)}
                  className="w-full h-10 p-1 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="dotsGradientColor2" className="block font-medium mb-1">Color 2:</label>
                <input 
                  type="color" 
                  id="dotsGradientColor2" 
                  value={dotsGradientColor2} 
                  onChange={(e) => setDotsGradientColor2(e.target.value)}
                  className="w-full h-10 p-1 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="dotsGradientRotation" className="block font-medium mb-1">Rotation (0-360):</label>
                <input 
                  type="number" 
                  id="dotsGradientRotation" 
                  value={dotsGradientRotation} 
                  onChange={(e) => setDotsGradientRotation(parseInt(e.target.value))}
                  min="0" 
                  max="360"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Background Options */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 pb-2 border-b">Background Options</h3>
          
          <div className="mb-4 flex items-center">
            <input 
              type="checkbox" 
              id="useBackgroundGradient" 
              checked={useBackgroundGradient} 
              onChange={(e) => setUseBackgroundGradient(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="useBackgroundGradient" className="font-medium">Use Gradient</label>
          </div>

          {!useBackgroundGradient ? (
            <div className="mb-4">
              <label htmlFor="backgroundColor" className="block font-medium mb-1">Color:</label>
              <input 
                type="color" 
                id="backgroundColor" 
                value={backgroundColor} 
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-full h-10 p-1 border border-gray-300 rounded"
              />
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <label htmlFor="backgroundGradientType" className="block font-medium mb-1">Gradient Type:</label>
                <select 
                  id="backgroundGradientType" 
                  value={backgroundGradientType} 
                  onChange={(e) => setBackgroundGradientType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="linear">Linear</option>
                  <option value="radial">Radial</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="backgroundGradientColor1" className="block font-medium mb-1">Color 1:</label>
                <input 
                  type="color" 
                  id="backgroundGradientColor1" 
                  value={backgroundGradientColor1} 
                  onChange={(e) => setBackgroundGradientColor1(e.target.value)}
                  className="w-full h-10 p-1 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="backgroundGradientColor2" className="block font-medium mb-1">Color 2:</label>
                <input 
                  type="color" 
                  id="backgroundGradientColor2" 
                  value={backgroundGradientColor2} 
                  onChange={(e) => setBackgroundGradientColor2(e.target.value)}
                  className="w-full h-10 p-1 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="backgroundGradientRotation" className="block font-medium mb-1">Rotation (0-360):</label>
                <input 
                  type="number" 
                  id="backgroundGradientRotation" 
                  value={backgroundGradientRotation} 
                  onChange={(e) => setBackgroundGradientRotation(parseInt(e.target.value))}
                  min="0" 
                  max="360"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Image Options */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 pb-2 border-b">Image Options</h3>
          
          <div className="mb-4">
            <label htmlFor="imageUrl" className="block font-medium mb-1">Image URL:</label>
            <input 
              type="text" 
              id="imageUrl" 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block font-medium mb-1">OR Upload Local Image:</label>
            <div className="flex items-center mt-1">
              <input 
                type="file" 
                id="imageFile" 
                onChange={handleFileChange}
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-500 text-white py-2 px-4 rounded mr-2"
              >
                Choose File
              </button>
              <span className="text-gray-500">
                {imageFile ? imageFile.name : 'No file chosen'}
              </span>
            </div>
          </div>
          
          <div className="mb-4 flex items-center">
            <input 
              type="checkbox" 
              id="useProxy" 
              checked={useProxy} 
              onChange={(e) => setUseProxy(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="useProxy" className="font-medium">Use CORS proxy if direct image loading fails</label>
          </div>
          
          <div className="mb-4">
            <label htmlFor="imageMargin" className="block font-medium mb-1">Margin:</label>
            <input 
              type="number" 
              id="imageMargin" 
              value={imageMargin} 
              onChange={(e) => setImageMargin(parseInt(e.target.value))}
              min="0" 
              max="50"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="imageSize" className="block font-medium mb-1">Size (0.0-1.0):</label>
            <input 
              type="number" 
              id="imageSize" 
              value={imageSize} 
              onChange={(e) => setImageSize(parseFloat(e.target.value))}
              min="0.0" 
              max="1.0" 
              step="0.1"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Error Correction Level */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 pb-2 border-b">Error Correction Level</h3>
          
          <div className="mb-4">
            <label htmlFor="errorCorrectionLevel" className="block font-medium mb-1">Level:</label>
            <select 
              id="errorCorrectionLevel" 
              value={errorCorrectionLevel} 
              onChange={(e) => setErrorCorrectionLevel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="L">L - Low (7%)</option>
              <option value="M">M - Medium (15%)</option>
              <option value="Q">Q - Quartile (25%)</option>
              <option value="H">H - High (30%)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 sticky top-0 text-center">
        <h2 className="text-xl font-bold mb-4">QR Code Preview</h2>
        
        <div ref={canvasRef} className="inline-block"></div>
        
        <div className="mt-6">
          <button 
            onClick={updateQrCode}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded mr-3"
          >
            Update QR Code
          </button>
          <button 
            onClick={downloadQrCode}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded"
          >
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
