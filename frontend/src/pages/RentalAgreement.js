import React, { useState } from 'react';

const RentalAgreement = () => {
  const [agreementData, setAgreementData] = useState({
    productName: '',
    rentalDuration: '',
    customerName: '',
    customerEmail: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgreementData({ ...agreementData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Agreement data:', agreementData);
    // Submit the agreement to the backend API here
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded">
      <h2 className="text-2xl font-bold mb-4">Rental Agreement</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="w-full p-2 mb-4 border rounded"
          placeholder="Product Name"
          name="productName"
          value={agreementData.productName}
          onChange={handleChange}
        />
        <input
          type="number"
          className="w-full p-2 mb-4 border rounded"
          placeholder="Rental Duration (days)"
          name="rentalDuration"
          value={agreementData.rentalDuration}
          onChange={handleChange}
        />
        <input
          type="text"
          className="w-full p-2 mb-4 border rounded"
          placeholder="Customer Name"
          name="customerName"
          value={agreementData.customerName}
          onChange={handleChange}
        />
        <input
          type="email"
          className="w-full p-2 mb-4 border rounded"
          placeholder="Customer Email"
          name="customerEmail"
          value={agreementData.customerEmail}
          onChange={handleChange}
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Submit Agreement
        </button>
      </form>
    </div>
  );
};

export default RentalAgreement;
