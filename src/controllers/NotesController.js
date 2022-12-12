const AppError = require("../utils/AppError");

const knex = require("../database/knex");

class NotesController {
    async index(request, response) {
        const { user_id, title, tags } = request.query;

        let notes;

        if (tags) {
            const tagsFilter = tags.split(",").map(tag => tag.trim());
            notes = await knex("tags")
                .select([
                    "notes.id",
                    "notes.title",
                    "notes.description",
                    "notes.rating",
                    "notes.user_id",
                    "notes.created_at",
                    "notes.updated_at",
                ])
                .where("notes.user_id", user_id)
                .whereLike("notes.title", `%${title}%`)
                .whereIn("tags.name", tagsFilter)
                .orderBy("notes.title")
                .innerJoin("notes", "notes.id", "tags.note_id");
        } else {
            notes = await knex("notes")
                .where({ user_id })
                .whereLike("title", `%${title}%`)
                .orderBy("notes.title")
        };

        const allTags = await knex("tags").where({ user_id });
        const notesWithTag = notes.map(note => {
            const filterTags = allTags.filter(({ note_id }) => note_id == note.id);
            const tagsName = filterTags.map(({ name }) => name);
            return {
                ...note,
                tags: tagsName
            };
        });

        return response.json(notesWithTag);
    };

    async show(request, response) {
        const { id } = request.params;

        const note = await knex("notes").where({ id }).first();

        if (!note) throw new AppError("Nota não encontrada.", 404);

        const dataTags = await knex("tags").where("note_id", id).orderBy("name");
        const tagsName = dataTags.map(({ name }) => name);

        return response.json({
            ...note,
            tags: tagsName
        });
    };

    async create(request, response) {
        const { user_id } = request.query;
        const { title, description, rating, tags } = request.body;

        if (!user_id) throw new AppError("Necessário informar um ID de usuário.");
        if (!title) throw new AppError("Necessário informar um título.");
        if (!description) throw new AppError("Necessário informar uma descrição.");
        if (!rating) throw new AppError("Necessário informar uma nota.");
        if (!tags) throw new AppError("Necessário informar as tags.");

        const isValidRating = rating >= 0 && rating <= 5;
        if (!isValidRating) throw new AppError("Nota inválida, informe uma nota de 0 a 5.");

        const note_id = await knex("notes").insert({
            title,
            description,
            rating,
            user_id
        });

        const tagsInsert = tags.map(name => {
            return {
                note_id,
                user_id,
                name
            };
        });

        await knex("tags").insert(tagsInsert);

        return response.status(201).json({ message: "Nota criada com sucesso." });
    };

    async delete(request, response) {
        const { id } = request.params;

        const existsNote = await knex("notes").where({ id }).delete();

        if (!existsNote) throw new AppError("Nota não encontrada.", 404);

        return response.json({ message: "Nota deletada com sucesso." });
    };
};

module.exports = NotesController;