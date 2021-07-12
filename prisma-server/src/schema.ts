import {
  intArg,
  makeSchema,
  nonNull,
  objectType,
  stringArg,
  inputObjectType,
  arg,
  asNexusMethod,
  enumType,
} from 'nexus'
import { DateTimeResolver } from 'graphql-scalars'
import { Context } from './context'

export const DateTime = asNexusMethod(DateTimeResolver, 'date')

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('allUsers', {
      type: 'User',
      resolve: (_parent, _args, context: Context) => {
        return context.prisma.user.findMany()
      },
    })

    t.nullable.field('comicById', {
      type: 'Comic',
      args: {
        id: intArg(),
      },
      resolve: (_parent, args, context: Context) => {
        return context.prisma.comic.findUnique({
          where: { id: args.id || undefined },
        })
      },
    })

    t.list.field('allComics', {
      type: 'Comic',
      resolve: (_parent, args, context: Context) => {
        return context.prisma.comic.findMany()
      },
    })

    t.list.field('comicsByUser', {
      type: 'Comic',
      args: {
        userUniqueInput: nonNull(
          arg({
            type: 'UserUniqueInput',
          }),
        ),
      },
      resolve: (_parent, args, context: Context) => {
        return context.prisma.user
          .findUnique({
            where: {
              id: args.userUniqueInput.id || undefined,
              email: args.userUniqueInput.email || undefined,
            },
          })
          .comics()
      },
    })
  },
})

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.nonNull.field('signupUser', {
      type: 'User',
      args: {
        data: nonNull(
          arg({
            type: 'UserCreateInput',
          }),
        ),
      },
      resolve: (_, args, context: Context) => {
        const comicData = args.data.comics?.map((comic: any) => {
          return { title: comic.title, publisher: comic.publisher, issueNumber: comic.issueNumber }
        })
        return context.prisma.user.create({
          data: {
            name: args.data.name,
            email: args.data.email,
            comics: {
              create: comicData
            },
          },
        })
      },
    })

    t.field('createComic', {
      type: 'Comic',
      args: {
        data: nonNull(
          arg({
            type: 'ComicCreateInput',
          }),
        ),
        ownerEmail: nonNull(stringArg()),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.comic.create({
          data: {
            title: args.data.title,
            publisher: args.data.publisher,
            issueNumber: args.data.issueNumber,
            owner: {
              connect: { email: args.ownerEmail },
            },
          },
        })
      },
    })
   
    t.field('deleteComic', {
      type: 'Comic',
      args: {
        id: nonNull(intArg()),
      },
      resolve: (_, args, context: Context) => {
        return context.prisma.comic.delete({
          where: { id: args.id },
        })
      },
    })
  },
})

const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.int('id')
    t.string('name')
    t.nonNull.string('email')
    t.nonNull.list.nonNull.field('comics', {
      type: 'Comic',
      resolve: (parent, _, context: Context) => {
        return context.prisma.user
          .findUnique({
            where: { id: parent.id || undefined },
          })
          .comics()
      },
    })
  },
})

const Comic = objectType({
  name: 'Comic',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.nonNull.string('title')
    t.nonNull.int('issueNumber')
    t.string('publisher')
    t.field('owner', {
      type: 'User',
      resolve: (parent, _, context: Context) => {
        return context.prisma.comic
          .findUnique({
            where: { id: parent.id || undefined },
          })
          .owner()
      },
    })
  },
})

const SortOrder = enumType({
  name: 'SortOrder',
  members: ['asc', 'desc'],
})

const UserUniqueInput = inputObjectType({
  name: 'UserUniqueInput',
  definition(t) {
    t.int('id')
    t.string('email')
  },
})

const ComicCreateInput = inputObjectType({
  name: 'ComicCreateInput',
  definition(t) {
    t.nonNull.string('title')
    t.nonNull.string('publisher')
    t.nonNull.int('issueNumber')
  },
})

const UserCreateInput = inputObjectType({
  name: 'UserCreateInput',
  definition(t) {
    t.nonNull.string('email')
    t.string('name')
    t.list.nonNull.field('comics', { type: 'ComicCreateInput' })
  },
})

export const schema = makeSchema({
  types: [
    Query,
    Mutation,
    Comic,
    User,
    UserUniqueInput,
    UserCreateInput,
    ComicCreateInput,
    SortOrder,
    DateTime,
  ],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})
