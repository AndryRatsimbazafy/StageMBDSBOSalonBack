import * as fs from "fs";
import * as path from "path";
import { Response, Request, NextFunction } from "express";
import { asyncHandler } from "../middlewares";
import assets from "../models/assets";
import * as fse from "fs-extra";
import { ErrorResponse } from "../utils";
import * as Busboy from 'busboy';
import rooms from "../models/rooms";
class AssetsController {
  constructor() { }
  private basePath: string = path.join(process.cwd(), "public/data/assets");
  private assetsPath: string = "public/data/assets";
  private extImgValid = [".png", ".jpg", ".jpeg", ".PNG", ".JPG", ".JPEG"];
  private extLogoValid = [".svg", ".pdf", ".ai", ".eps"];
  private extVideoValid = [".avi", ".mp4", ".AVI", ".MP4"];
  private extFlyerValid = [".pdf", ".PDF"];

  /**
   * @description Create new assets
   * @route   POST  /api/assets/createAsset
   * @access  Exposant and Admin
   */
  createAsset = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
      try {
        /** all file names */
        const allFileNames = [];

        /** Create folder if not exists */
        fse.ensureDirSync(`${this.basePath}/${req.body.idExposant}`);
        /** Upload Logo fiel */
        const logoFile = req.files["logo"][0];

        const logo = this.cleanFileName(logoFile.filename, allFileNames);

        const logoExt = path.extname(logoFile.filename);

        if (!this.extLogoValid.includes(logoExt)) {
          return next(new ErrorResponse("Extension du logo invalide", 400));
        }
        fs.renameSync(
          path.join(process.cwd(), logoFile.path),
          `${this.basePath}/${req.body.idExposant}/${logo}`
        );


        /** Upload Flyer file if exists */
        let flyerFile: any;
        let flyers: any;
        let flyerList: Array<any> = [];
        if (req.files["flyers"] !== undefined) {
          const flyerArray = req.files["flyers"];

          for (let i in flyerArray) {
            flyerFile = flyerArray[i];
            const flyerExt = path.extname(flyerFile.filename);
            if (!this.extFlyerValid.includes(flyerExt)) {
              return next(new ErrorResponse("Veuillez uploader un fichier .pdf pour le flyer", 400));
            }

            let flyerItem = this.cleanFileName(flyerFile.filename, allFileNames);
            fs.renameSync(
              path.join(process.cwd(), flyerFile.path),
              `${this.basePath}/${req.body.idExposant}/${flyerItem}`
            );
            flyerList.push(flyerItem);
          }
          flyers = flyerList;
        }

        /** Upload Gallery file if exists */
        let galleryFile: any;
        let gallery: any;
        let galleryList: Array<any> = [];
        if (req.files["gallery"] !== undefined) {
          const galleryArray = req.files["gallery"];

          for (let i in galleryArray) {
            galleryFile = galleryArray[i];
            const galleryExt = path.extname(galleryFile.filename);
            if (!this.extImgValid.includes(galleryExt)) {
              return next(new ErrorResponse("Extension de la photo de la galerie invalide.", 400));
            }

            let galleryItem = this.cleanFileName(galleryFile.filename, allFileNames);
            fs.renameSync(
              path.join(process.cwd(), galleryFile.path),
              `${this.basePath}/${req.body.idExposant}/${galleryItem}`
            );
            galleryList.push(galleryItem);
          }
          gallery = galleryList;
        }

        /** Upload Video file if exists */
        let videos: Array<any> = [];
        if (req.body.videos) {
          const parsedVideos = JSON.parse(req.body.videos);
          if (Array.isArray(parsedVideos) && parsedVideos.length) {
            parsedVideos.forEach((v, it) => {
              const videoExt = path.extname(v);
              if (!this.extVideoValid.includes(videoExt)) {
                return next(new ErrorResponse("Fichier video invalide.", 400));
              }
              const cleanName = this.cleanFileName(v, allFileNames);
              fs.renameSync(
                path.join(process.cwd(), 'public/tmp/' + v),
                `${this.basePath}/${req.body.idExposant}/${cleanName}`
              );
              videos.push({
                index: it + 1,
                name: cleanName,
              });
            });
          }
        }

        let idExposant: string;
        idExposant = req.body.idExposant;
        const asset = await assets.create({
          idExposant,
          logo,
          videos,
          flyers,
          gallery,
        });

        res.status(200).json({
          success: true,
          body: asset,
        });
      } catch (error) {
        return next(
          (error && error.message)
            ? new ErrorResponse(error.message, 500)
            : new ErrorResponse("Erreur du serveur", 500)
        );
      }
    }
  );

  /**
   * @description Get all assets
   * @route   GET  /api/assets
   * @access  Private: Admin
   */
  getAllAssets = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {

      const asset: any = await assets.find();

      res.status(200).json({
        success: true,
        body: asset
      });
    }
  );

  /**
   * @description Get all exposant assets dans unity
   * @route   GET  /api/unity/assets
   */
  getAllExposantAssets = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      console.log('proof of work exposant')
      const asset: any = await assets.find().populate('idExposant');
      let unityAssets = await this.assetsUnityFormat(asset)
      res.status(200).json({
        success: true,
        body: unityAssets,
      });
    }
  );

  /**
   * @description Get all exposant assets dans unity
   * @route   GET  /api/unity/hall 
   */
  getHallExposantAssets = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      console.log('proof of work hall 2')
      const search = [
        'StandID4', 'StandID2', 'StandID1', 'StandID5'
      ]
      const asset: any = await assets.find({
        gameObjectId: {
          $in: search
        }
      }).populate('idExposant').limit(4); // ariston - POINT FORT - Endgie - Créateur Esc
      const assetInOrder = []
      if(asset){
        for (let i = 0; i < asset.length; i++) {
          assetInOrder.push(asset.find(e => e.gameObjectId == search[i]))
        }
      }
      let unityAssets = await this.assetsUnityFormat(assetInOrder)
      res.status(200).json({
        success: true,
        body: unityAssets,
      });
    }
  );

  /**
   * @description Get one asset
   * @route   GET  /api/assets/:_id
   * @access  Private: Admin
   */
  getOneAsset = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      const accessToken = user.generateAccessToken('2h');
      const _id = req.params._id;

      const asset: any = await assets.findById(_id);

      res.status(200).json({
        success: true,
        body: asset,
        accessToken
      });
    }
  );

  /**
   * @description Get one asset
   * @route   GET  /api/assets/exhibitor/:_id
   * @access  Private: Admin
   */
  getOneAssetByExhibitorId = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      const accessToken = user.generateAccessToken('2h');
      const idExhibitor = req.params._id;

      const asset: any = await assets.findOne({ idExposant: idExhibitor });

      res.status(200).json({
        success: true,
        body: asset,
        accessToken
      });
    }
  );

  /**
   * @description Update one asset
   * @route   POST  /api/assets/:_id
   * @access  Private: exposant/admin
   */

  /** Method to remove one file */
  removeSingleFile(fileToRemove) {
    if (fileToRemove && fileToRemove !== null) {
      try {
        fs.unlinkSync(fileToRemove);
      } catch (e) {
        console.trace(e);
      } finally {
        return;
      }
    }
  }

  /** Method to remove many files, files must store in array */
  removeManyFiles(filesToRemove: [string]) {
    try {
      if (typeof filesToRemove === "object") {
        for (let i in filesToRemove) {
          this.removeSingleFile(filesToRemove[i])
        }
      }
    } catch (e) {
      console.trace(e);
    } finally {
      return;
    }
  }

  /** Method to check valid extension file */
  validateExtFile(files: any, extvalid: string[]) {
    if (files && extvalid.length) {
      const ext = path.extname(files.filename);
      return ext ? extvalid.includes(ext.toLowerCase()) : false;
    }
  }

  /** Methode to upload all files */
  uploadFiles(
    filepath: string,
    basepath: string,
    userid: string,
    filename: string
  ) {
    if (filepath && basepath && userid && filename) {
      try {
        return fs.renameSync(
          path.join(process.cwd(), filepath),
          `${basepath}/${userid}/${filename}`
        );
      } catch (e) {
        console.trace(e);
      } finally {
        return;
      }
    }
  }

  updateAsset = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
      if (!req.files) {
        this.deleteAssetItem(req, res, next);
        return;
      }

      const allFileNames = [];
      const _id = req.params._id;
      const updatedAt = Date.now();
      let getCurrentAsset = await assets.findById(_id);

      const logoFile = req.files["logo"][0];
      let logo: string;
      if (!this.validateExtFile(logoFile, this.extLogoValid)) {
        return next(new ErrorResponse("Extension du logo invalide", 400));
      }
      const currentLogo = getCurrentAsset["logo"];
      if (currentLogo) this.removeSingleFile(`${this.basePath}/${req.body.idExposant}/${currentLogo}`);

      logo = this.cleanFileName(logoFile.filename, allFileNames);
      this.uploadFiles(
        logoFile.path,
        this.basePath,
        req.body.idExposant,
        logo
      );

      /** Update - upload Flyer file if exists and remove it is null */
      let flyerFile: any;
      let flyerPath: any;
      let flyerList: Array<any> = [];
      let flyer: string[];
      const getCurrentFlyers = getCurrentAsset["flyers"];
      if (getCurrentFlyers) {
        getCurrentFlyers.forEach((element, index) => {
          getCurrentFlyers[index] = `${this.basePath}/${req.body.idExposant}/${element}`
        });
      }
      if (req.files["flyers"] !== undefined) {
        const flyerArray = req.files["flyers"];

        /** Verify extension */
        for (let i in flyerArray) {
          flyerFile = flyerArray[i];
          if (!this.validateExtFile(flyerFile, this.extFlyerValid)) {
            return next(new ErrorResponse("Veuillez uploader un fichier .pdf pour le flyer", 400));
          }
        }

        /** Remove flyers files */
        this.removeManyFiles(getCurrentFlyers);

        /** Update flyers */
        for (let k in flyerArray) {
          flyerPath = flyerArray[k];
          let flyerFilename = this.cleanFileName(flyerPath.filename, allFileNames);
          this.uploadFiles(
            flyerPath.path,
            this.basePath,
            req.body.idExposant,
            flyerFilename
          );
          flyerList.push(flyerFilename);
        }
        flyer = flyerList;
      } else {
        flyer = [];
        this.removeManyFiles(getCurrentFlyers);
      }

      /** Update - upload Gallery file if exists and remove it is null */
      let galleryFile: any;
      let galleryPath: any;
      let galleryList: Array<any> = [];
      let gallery: string[];
      const getCurrentGallery = getCurrentAsset["gallery"];
      if (getCurrentGallery) {
        getCurrentGallery.forEach((element, index) => {
          getCurrentGallery[index] = `${this.basePath}/${req.body.idExposant}/${element}`
        });
      }
      if (req.files["gallery"] !== undefined) {
        const galleryArray = req.files["gallery"];

        /** Verify extension */
        for (let i in galleryArray) {
          galleryFile = galleryArray[i];
          if (!this.validateExtFile(galleryFile, this.extImgValid)) {
            return next(new ErrorResponse("Extension de la photo de la galerie invalide.", 400));
          }
        }

        /** Remove gallery files */
        this.removeManyFiles(getCurrentGallery);

        /** Update gallery */
        for (let k in galleryArray) {
          galleryPath = galleryArray[k];
          let galleryFilename = this.cleanFileName(galleryPath.filename, allFileNames);

          this.uploadFiles(
            galleryPath.path,
            this.basePath,
            req.body.idExposant,
            galleryFilename
          );

          galleryList.push(galleryFilename);
        }
        gallery = galleryList;
      } else {
        gallery = [];
        this.removeManyFiles(getCurrentGallery);
      }

      /** Update - upload Video file and remove after if Video is null */
      let videoList: Array<any> = [];
      const getCurrentVideos = getCurrentAsset["videos"];
      if (getCurrentVideos) {
        getCurrentVideos.forEach((element, index) => {
          getCurrentVideos[index] = `${this.basePath}/${req.body.idExposant}/${element.name}`
        });
      }
      if (req.body.videos) {
        const parsedVideos = JSON.parse(req.body.videos);
        if (Array.isArray(parsedVideos) && parsedVideos.length) {
          /** Verify extension */
          for (let i in parsedVideos) {
            const videoExt = path.extname(parsedVideos[i]);
            if (!this.extVideoValid.includes(videoExt)) {
              return next(new ErrorResponse("Fichier video invalide.", 400));
            }
          }

          /** Remove videos files */
          this.removeManyFiles(getCurrentVideos);

          /** Update videos */
          for (let k in parsedVideos) {
            let videoFilename = this.cleanFileName(parsedVideos[k], allFileNames);
            this.uploadFiles(
              'public/tmp/' + parsedVideos[k],
              this.basePath,
              req.body.idExposant,
              videoFilename
            );
            videoList.push({
              index: (JSON.parse(k) + 1),
              name: videoFilename,
            });
          }
        }
      } else {
        return next(new ErrorResponse("Video invalide.", 400));
      }
      ///////////////

      let assetBody: Object = {};
      if (logo !== undefined) {
        assetBody["logo"] = logo;
      }
      if (flyer !== undefined) {
        assetBody["flyers"] = flyer;
      }
      if (gallery !== undefined) {
        assetBody["gallery"] = gallery;
      }
      if (videoList !== undefined || videoList !== null) {
        assetBody["videos"] = videoList;
      }

      assetBody["updatedAt"] = updatedAt;

      const asset: any = await assets.findByIdAndUpdate(_id, assetBody, {
        new: true,
      });

      res.status(200).json({
        success: true,
        body: asset,
      });
    }
  );

  deleteAssetItem = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
      const _id = req.params._id;
      const updatedAt = Date.now();
      let getCurrentAsset = await assets.findById(_id);
      let newAsset = JSON.parse(JSON.stringify(getCurrentAsset));

      // flyers
      if (!req.body.flyers) {
        if (getCurrentAsset["flyers"]) {
          getCurrentAsset["flyers"].forEach((element, index) => {
            getCurrentAsset["flyers"][index] = `${this.basePath}/${req.body.idExposant}/${element}`
          });
          this.removeManyFiles(getCurrentAsset["flyers"]);
        }
        newAsset.flyers = null;
      } else {
        let flyersToRemove = [];
        if (getCurrentAsset["flyers"]) getCurrentAsset["flyers"].forEach(element => {
          if (!req.body.flyers.includes(element)) flyersToRemove.push(`${this.basePath}/${req.body.idExposant}/${element}`);
        });
        this.removeManyFiles((flyersToRemove as [string]));
        newAsset.flyers = req.body.flyers;
      }

      // gallery
      if (!req.body.gallery) {
        if (getCurrentAsset["gallery"]) {
          getCurrentAsset["gallery"].forEach((element, index) => {
            getCurrentAsset["gallery"][index] = `${this.basePath}/${req.body.idExposant}/${element}`
          });
          this.removeManyFiles(getCurrentAsset["gallery"]);
        }
        newAsset.gallery = null;
      } else {
        let galleryToRemove = [];
        if (getCurrentAsset["gallery"]) getCurrentAsset["gallery"].forEach(element => {
          if (!req.body.gallery.includes(element)) galleryToRemove.push(`${this.basePath}/${req.body.idExposant}/${element}`);
        });
        this.removeManyFiles((galleryToRemove as [string]));
        newAsset.gallery = req.body.gallery;
      }

      // videos
      if (!req.body.videos) {
        if (getCurrentAsset["videos"]) {
          getCurrentAsset["videos"].forEach((element, index) => {
            getCurrentAsset["videos"][index] = `${this.basePath}/${req.body.idExposant}/${element.name}`
          });
          this.removeManyFiles(getCurrentAsset["videos"]);
        }
        newAsset.videos = null;
      } else {
        let videosToRemove = [];
        if (getCurrentAsset["videos"]) {
          newAsset.videos = [];
          getCurrentAsset["videos"].forEach(element => {
            const namesOnly = req.body.videos.map(e => e.name);
            if (!namesOnly.includes(element.name)) videosToRemove.push(`${this.basePath}/${req.body.idExposant}/${element.name}`);
            else newAsset.videos.push(element);
          });
        }
        this.removeManyFiles((videosToRemove as [string]));
        newAsset.videos = req.body.videos;
      }

      newAsset.updatedAt = updatedAt;

      const asset: any = await assets.findByIdAndUpdate(_id, newAsset, {
        new: true,
      });

      res.status(200).json({
        success: true,
        body: asset,
      });
    }
  );

  /**
   * @description Delete one asset
   * @route   DELETE  /api/assets/:_id
   * @access  Private: Admin
   */
  deleteAsset = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const _id = req.params._id;

      const asset: any = await assets.findByIdAndRemove(_id);

      res.status(200).json({
        success: true,
        body: asset,
      });
    }
  );

  cleanFileName(str, allFileNames?): string {
    if (allFileNames) str = this.renameFileIfExist(allFileNames, str);
    return str.replace(/[^A-Z0-9.]+/ig, "-");
  }

  renameFileIfExist(names, filename, level?): any {
    let newFn = filename;
    if (filename) {
      if (!level) {
        level = 0;
      }
      if (names.includes(filename)) {
        level++;
        const spliter = `(${level - 1})`;
        newFn = level === 0 ? `${filename} (${level})` : `${filename.split(spliter)[0].trim()} (${level})`;
        const existFn = this.renameFileIfExist(names, newFn, level);
        if (!existFn) {
          names.push(newFn);
        } else {
          newFn = existFn;
        }
      } else {
        if (level === 0) {
          names.push(newFn);
        } else {
          return undefined;
        }
      }
    }
    return newFn;
  }

  // upload ONE by ONE 
  uploadUsingBusboy(req, res, next) {
    if (req.headers['content-type'] === 'application/json') {
      next();
    } else {
      // res.writeHead(200, { 'Content-Type': 'text/plain' });
      var fstream;
      var files: any = {};
      let fileCounter = 0;

      var busboy = new Busboy({ headers: req.headers });

      busboy.on('field', function (fieldname, value) {
        req.body[fieldname] = value;
      })

      busboy.on('file', function (fieldname, file, filename) {

        fileCounter++;
        let p = 'public/tmp/' + filename;
        fstream = fs.createWriteStream(path.join(process.cwd(), p));
        file.pipe(fstream);

        file.on('data', function (data) {
          // console.log('... File [' + filename + ']: ' + (fs.statSync(path.join(process.cwd(), p)).size / 1000000) + ' Mb');
        });

        fstream.on('close', function (f) {
          fileCounter--;
          if (files[fieldname]) {
            files[fieldname].push({ filename, path: p })
          } else {
            files[fieldname] = [{ filename, path: p }];
          }

          if (fileCounter === 0) {
            req.files = files;
            next()
          }
        });
      });

      busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
        // console.log('Field [' + fieldname + ']: ', val);
      });

      req.pipe(busboy);
    }
  }

  updateAssetItem = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {

      const publicTmp = 'public/tmp/';
      fse.ensureDirSync(`${this.basePath}/${req.body.idExposant}`); // Create folder if not exists
      let assetBody: Object = {};

      const _id = req.params._id;
      const updatedAt = Date.now();
      let getCurrentAsset;
      if (!_id || _id === 'undefined') {
        getCurrentAsset = {};
      } else {
        getCurrentAsset = await assets.findById(_id);
        assetBody = {
          logo: getCurrentAsset['logo'],
          flyers: getCurrentAsset['flyers'],
          gallery: getCurrentAsset['gallery'],
          videos: getCurrentAsset['videos'],
        }
      }

      if (req.body.logo) {
        const logoExt = path.extname(req.body.logo);
        let logoFileName = path.basename(req.body.logo);
        if (!this.extLogoValid.includes(logoExt)) {
          return next(new ErrorResponse("Extension du logo invalide.", 400));
        }
        const currentLogo = getCurrentAsset["logo"];
        if (currentLogo) this.removeSingleFile(`${this.basePath}/${req.body.idExposant}/${currentLogo}`);

        // logoFileName = `${logoFileName}_${updatedAt}${logoExt}`
        this.uploadFiles(
          publicTmp + req.body.logo,
          this.basePath,
          req.body.idExposant,
          logoFileName
        );

        assetBody["logo"] = logoFileName;
      }

      let fullFilename;
      let extValid;
      let extInvalidError;
      let type;

      if (req.body.flyer) {
        fullFilename = req.body.flyer;
        extValid = this.extFlyerValid;
        extInvalidError = 'Extension du flyer invalide.'
        type = 'flyers'
        const fileExt = path.extname(fullFilename);
        let fileName = path.basename(fullFilename);
        if (!extValid.includes(fileExt)) {
          return next(new ErrorResponse(extInvalidError, 400));
        }
        // const currentItem = getCurrentAsset[type];
        // this.removeSingleFile(`${this.basePath}/${req.body.idExposant}/${currentItem}`);
        this.uploadFiles(
          publicTmp + fullFilename,
          this.basePath,
          req.body.idExposant,
          fileName
        );
        if (Array.isArray(getCurrentAsset[type]) && getCurrentAsset[type].length) {
          getCurrentAsset[type].push(fileName);
          assetBody[type] = getCurrentAsset[type];
        } else {
          assetBody[type] = [fileName];
        }
      }

      if (req.body.gallery) {
        fullFilename = req.body.gallery;
        extValid = this.extImgValid;
        extInvalidError = 'Extension de l\'image invalide.'
        type = 'gallery'
        const fileExt = path.extname(fullFilename);
        let fileName = path.basename(fullFilename);
        if (!extValid.includes(fileExt)) {
          return next(new ErrorResponse(extInvalidError, 400));
        }
        this.uploadFiles(
          publicTmp + fullFilename,
          this.basePath,
          req.body.idExposant,
          fileName
        );
        if (Array.isArray(getCurrentAsset[type]) && getCurrentAsset[type].length) {
          getCurrentAsset[type].push(fileName);
          assetBody[type] = getCurrentAsset[type];
        } else {
          assetBody[type] = [fileName];
        }
      }

      if (req.body.video) {
        fullFilename = req.body.video.name;
        extValid = this.extVideoValid;
        extInvalidError = 'Extension de la vidéo invalide.'
        type = 'videos'
        const fileExt = path.extname(fullFilename);
        let fileName = path.basename(fullFilename);
        if (!extValid.includes(fileExt)) {
          return next(new ErrorResponse(extInvalidError, 400));
        }
        const currentItem = getCurrentAsset[type];
        if (Array.isArray(currentItem) && currentItem.length) {
          const concernedVideo = currentItem.find(o => o.index === req.body.video.index);

          if (concernedVideo) {
            this.removeSingleFile(`${this.basePath}/${req.body.idExposant}/${concernedVideo.name}`);
            let obj = currentItem.find((o, i) => {
              if (o.index === req.body.video.index) {
                getCurrentAsset[type].splice(i, 1);
                return true; // stop searching
              }
            });
          }
        }
        this.uploadFiles(
          publicTmp + fullFilename,
          this.basePath,
          req.body.idExposant,
          fileName
        );
        if (Array.isArray(getCurrentAsset[type]) && getCurrentAsset[type].length) {
          getCurrentAsset[type].push(req.body.video);
          assetBody[type] = getCurrentAsset[type];
        } else {
          assetBody[type] = [req.body.video];
        }
      }

      assetBody["idExposant"] = req.body.idExposant;
      assetBody["updatedAt"] = updatedAt;

      let asset: any;

      if (!req.params._id || req.params._id === 'undefined') {
        assetBody["createdAt"] = updatedAt;
        asset = await assets.create(assetBody);
      } else {
        asset = await assets.findByIdAndUpdate(_id, assetBody, {
          new: true,
        });
      }

      res.status(200).json({
        success: true,
        body: asset,
      });
    }
  );

  async assetsUnityFormat(assets: any) {
    const unityAssets = []
    if (assets) {
      for (let element of assets) {
        if (element.idExposant && element.idExposant._id) { // if exposant exist
          const exposantRoom: any = await rooms.findOne({ user_id: element.idExposant._id }).populate('commercial.user_id');

          let newFlyers = [];
          element.flyers.forEach(item => {
            newFlyers.push(`${this.assetsPath}/${element.idExposant._id}/${item}`);
          });
          let newGallery = [];
          element.gallery.forEach(item => {
            newGallery.push(`${this.assetsPath}/${element.idExposant._id}/${item}`);
          });
          let newVideos = [];
          element.videos.forEach(item => {
            newVideos.push({
              index: item.index,
              url: `${this.assetsPath}/${element.idExposant._id}/${item.name}`,
            });
          });

          const commercial = exposantRoom ? exposantRoom.commercial : []
          exposantRoom.commercial = undefined
          unityAssets.push(
            {
              _id: element._id,
              companyName: element.idExposant.companyName ? element.idExposant.companyName : '',
              logo: `${this.assetsPath}/${element.idExposant._id}/${element.logo}`,
              videos: newVideos,
              gallery: newGallery,
              flyers: newFlyers,
              commercial: commercial,
              gameObjectId: element.gameObjectId,
              room: exposantRoom
            }
          );
        }
      }
    }
    return unityAssets
  }
}

const assetsController = new AssetsController();

export default assetsController;