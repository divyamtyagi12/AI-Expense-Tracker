// backend/src/controllers/categoryController.js

const { validationResult } = require('express-validator');
const categoryModel = require('../models/categoryModel');

// GET /api/categories
async function getCategories(req, res, next) {
  try {
    const categories = await categoryModel.findAllForUser(req.userId);
    res.json({ success: true, data: { categories } });
  } catch (err) {
    next(err);
  }
}

// POST /api/categories
async function createCategory(req, res, next) {
  try {
    const { name } = req.body;

    const existing = await categoryModel.findByNameForUser(req.userId, name);
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: 'A category with this name already exists' });
    }

    const category = await categoryModel.create(req.userId, name);
    res.status(201).json({ success: true, data: { category } });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/categories/:id
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    if (category.is_default) {
      return res
        .status(403)
        .json({ success: false, message: 'Default categories cannot be deleted' });
    }

    const deleted = await categoryModel.deleteOwnedByUser(id, req.userId);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: 'Category not found or not owned by you' });
    }

    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/categories/:id
async function renameCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(422).json({ success: false, message: 'name is required' });
    }

    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    if (category.is_default) {
      return res.status(403).json({ success: false, message: 'Default categories cannot be renamed' });
    }

    // Check for duplicate name
    const existing = await categoryModel.findByNameForUser(req.userId, name.trim());
    if (existing && existing.id !== Number(id)) {
      return res.status(409).json({ success: false, message: 'A category with that name already exists' });
    }

    const updated = await categoryModel.renameOwnedByUser(id, req.userId, name.trim());
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Category not found or not owned by you' });
    }

    res.json({ success: true, data: { category: updated } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories, createCategory, deleteCategory, renameCategory };
