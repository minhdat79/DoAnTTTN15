import { LockOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Select } from "antd";
import React, { useEffect, useState } from "react";
import UploadImage from "../UploadImage/UploadImage";
import { getAllBrand } from "../../service/brandService";

const ProductForm = ({ initialValues, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState("");
  const [listBrand, setListBrand] = useState([]);
  useEffect(() => {
    form.resetFields();
    if (initialValues) {
      const sizes = initialValues?.sizes?.map((item) => ({
        sizes: item,
      }));
      form.setFieldsValue({
        title: initialValues?.title,
        price: initialValues.price,
        productType: initialValues.productType,
        description: initialValues.description,
        img: initialValues.img,
        brand: initialValues.brand._id,
        sizes: sizes,
      });
      setImageUrl(initialValues.img);
    }
  }, [initialValues]);

  const handleFinish = (values) => {
    const sizes = values.sizes.map((item) => item.sizes);
    onSave({ ...values, img: imageUrl, sizes: sizes });
  };
  const handleUploadSuccess = (url) => {
    setImageUrl(url);
    message.success("Image uploaded successfully!");
  };
  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllBrand({ limit: 1000, page: 1 });
      if (res.status === 200) {
        setListBrand(res.data.data);
      }
    };
    fetchData();
  }, []);
  return (
    <Form form={form} onFinish={handleFinish} layout="vertical">
      <Form.Item
        name="title"
        label="Tên sản phẩm"
        rules={[
          {
            required: true,
            message: "Please input the product title!",
          },
        ]}
      >
        <Input placeholder="Nhập tên sản phẩm" />
      </Form.Item>
      <Form.Item
        name="price"
        label="Giá sản phẩm"
        rules={[
          {
            required: true,
            message: "Please input the price!",
          },
        ]}
      >
        <Input placeholder="Nhập Giá sản phẩm" />
      </Form.Item>
      <Form.Item
        name="description"
        label="mô tả sản phẩm"
        rules={[
          {
            required: true,
            message: "Please input the description!",
          },
        ]}
      >
        <Input placeholder="Nhập mô tả sản phẩm" />
      </Form.Item>
      <Form.Item
        name="brand"
        label="thương hiệu"
        rules={[
          {
            required: true,
            message: "Please select the brand!",
          },
        ]}
      >
        <Select>
          {listBrand?.map((brand) => (
            <Option key={brand._id} value={brand._id}>
              {brand?.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="productType"
        label="Thể loại"
        rules={[
          {
            required: true,
            message: "Please select the product type!",
          },
        ]}
      >
        <Select>
          <Option value="quần">Quần</Option>
          <Option value="áo">Áo</Option>
        </Select>
      </Form.Item>
      <Form.List name="sizes">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                }}
              >
                <Form.Item
                  {...field}
                  name={[field.name, "sizes"]}
                  fieldKey={[field.fieldKey, "sizes"]}
                  label="Size"
                  rules={[
                    {
                      required: true,
                      message: "Please input the size!",
                    },
                  ]}
                  style={{
                    flex: 1,
                    marginRight: "8px",
                  }}
                >
                  <Input />
                </Form.Item>
                <div>
                  <h1 className="mb-2 ml-2">Xóa trường</h1>
                  <Button
                    type="dashed"
                    onClick={() => remove(field.name)}
                    style={{
                      marginBottom: "24px",
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block>
                Thêm size mới
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      <UploadImage
        onUpdate={handleUploadSuccess}
        initUrl={initialValues ? initialValues?.img : ""}
      />

      <Form.Item className="mt-6">
        <Button type="primary" htmlType="submit">
          Save
        </Button>
        <Button onClick={onCancel} style={{ marginLeft: "8px" }}>
          Cancel
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProductForm;
