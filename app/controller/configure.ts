import { Request, Response } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { schedule, ScheduledTask } from 'node-cron';
import axios from 'axios';
import nodemailer from 'nodemailer';
import xml2js from 'xml2js';
import Parser from 'rss-parser';

let interval = 5;
let healthy_threshold = 3;
let unhealthy_threshold = 3;
let healthy_call = 0;
let unhealthy_call = 0;
let status = 'HEALTHY';
let job: any | null = null;
let transition = 0;
let data = null;
let feed:
  | ({ [key: string]: any } & Parser.Output<{ [key: string]: any }>)
  | null = null;
const resetParams = () => {
  data = JSON.parse(
    readFileSync(join(`${__dirname}`, '../../../config.json'), {
      encoding: 'utf8',
      flag: 'r',
    })
  );

  interval = data.interval;
  healthy_threshold = data.healthy_threshold;
  unhealthy_threshold = data.unhealthy_threshold;
};

const authorizationToken = process.env.auth_token;
const scheduleJob = (interval: BigInteger, email: string) => {
  console.log(`Calling scheduled health check with interval - ${interval}`);
  resetParams();
  job = schedule(`*/${interval} * * * * *`, async () => {
    try {
      transition = 0;
      const response = await axios.post(
        `https://tonto-http.cloudwalk.io?auth=${authorizationToken}&buf=test`
      );
      if (response.status == 200) {
        healthy_call += 1;
        unhealthy_call = 0;
        if (healthy_call === healthy_threshold) {
          healthy_call = 0;
          if (status == 'UNHEALTHY') {
            transition = 1;
          }
          status = 'HEALTHY';
        }
      } else {
        healthy_call = 0;
        unhealthy_call += 1;
        if (unhealthy_call === unhealthy_threshold) {
          unhealthy_call = 0;
          if (status == 'HEALTHY') {
            transition = 1;
          }
          status = 'UNHEALTHY';
        }
      }
      if (transition) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
          },
          logger: true,
        });
        const mailOptions = {
          from: 'thetestuser99@gmail.com',
          to: email,
          subject: 'Status of your API',
          text: `The status of your API is ${status}`,
        };
        let mailResult = await transporter.sendMail(
          mailOptions,
          function (error, result) {
            if (error) {
              console.log(error);
            } else {
              console.log(
                `Sending Email to - ${email} with status - ${status}`
              );
            }
          }
        );
        const feedObject = {
          rss: [
            {
              item: [
                {
                  title: 'Server Health',
                },
                {
                  description: `Your Server status is ${status}`,
                },
              ],
            },
          ],
        };
        const builder = new xml2js.Builder();
        const parsedXML = builder.buildObject(feedObject);
        const feed = '<?xml version="1.0" encoding="UTF-8"?>' + parsedXML;
        writeFileSync(
          join(`${__dirname}`, '../../../feed.rss'),
          JSON.stringify(feed)
        );
      }
    } catch (error) {
      console.log('Error - ', error);
      
    }
  });
  return job;
};

export const configureParams = (req: Request, res: Response) => {
  const data = JSON.parse(
    readFileSync(join(`${__dirname}`, '../../../config.json'), {
      encoding: 'utf8',
      flag: 'r',
    })
  );
  writeFileSync(
    join(`${__dirname}`, '../../../config.json'),
    JSON.stringify({ ...data, ...req.body })
  );
  if (job) {
    job.stop();
  }
  scheduleJob(req.body.interval, data.email);
  job.start();
  return res.send(req.body);
};

export const apiStatus = (req: Request, res: Response) => {
  return res.send({ status });
};

export const feedRSS = (req: Request, res: Response) => {
  return res.sendFile(join(`${__dirname}`, '../../../feed.rss'));
};
