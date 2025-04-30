
// Replace the handleChangeService function with this fixed version that ensures all values have the correct type
const handleChangeService = (index: number, field: keyof Service, value: string | number) => {
  const updatedServices = [...services];
  
  if (field === 'prix' || field === 'quantite') {
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value 
    };
  } else {
    updatedServices[index] = { 
      ...updatedServices[index], 
      [field as 'description']: String(value) 
    };
  }
  
  setServices(updatedServices);
  calculateTotal(updatedServices);
};
