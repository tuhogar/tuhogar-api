const properties = Symbol('properties');

// This decorator will be called for each property, and it stores the property name in an object.
export const Property = () => {
  return (obj: any, propertyName: string) => {
    (obj[properties] || (obj[properties] = [])).push(propertyName);
  };
};

// This is a function to retrieve the list of properties for a class
export function getProperties(obj: any): [] {
  return obj.prototype[properties];
}
